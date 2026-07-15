// ================================================================
// POST /api/dev/simulate-upgrade
// ================================================================
// Development-only endpoint. Simulates a PayPal webhook event by
// constructing a realistic payload and posting it to the local
// PayPal webhook handler — WITHOUT signature verification
// (since we can't generate a real PayPal signature locally).
//
// The PayPal webhook handler skips verification when
// PAYPAL_WEBHOOK_ID is not set, which is the case in development.
// ================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let eventType: string;
    let mockSubscriptionId: string;

    if (action === 'cancel') {
      eventType = 'BILLING.SUBSCRIPTION.CANCELLED';

      // Try to find existing subscription to use its real ID
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('paypal_subscription_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      mockSubscriptionId =
        existingSub?.paypal_subscription_id ?? `I-MOCK${Math.floor(Math.random() * 1000000)}`;
    } else {
      eventType = 'BILLING.SUBSCRIPTION.ACTIVATED';
      mockSubscriptionId = `I-MOCK${Math.floor(Math.random() * 1000000)}`;
    }

    // Construct a realistic PayPal webhook payload
    const nextBillingTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const mockPayload = {
      id: `WH-MOCK-${Date.now()}`,
      event_version: '1.0',
      create_time: new Date().toISOString(),
      resource_type: 'subscription',
      event_type: eventType,
      summary: `Simulated ${eventType}`,
      resource: {
        id: mockSubscriptionId,
        plan_id: process.env.PAYPAL_PLAN_ID ?? 'P-MOCK_PLAN_ID',
        custom_id: userId, // This is how we map back to the user
        status: action === 'cancel' ? 'CANCELLED' : 'ACTIVE',
        subscriber: {
          payer_id: 'MOCK_PAYER_ID',
          email_address: 'mock@devdistro.dev',
          name: { given_name: 'Mock', surname: 'User' },
        },
        billing_info: {
          next_billing_time: action === 'cancel' ? undefined : nextBillingTime,
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
      },
    };

    const rawBody = JSON.stringify(mockPayload);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Post to the local PayPal webhook handler
    // Note: signature verification is skipped when PAYPAL_WEBHOOK_ID is unset
    const res = await fetch(`${appUrl}/api/webhooks/paypal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // PayPal webhook headers (empty in dev — verification is skipped)
        'paypal-transmission-id': 'mock-transmission-id',
        'paypal-transmission-time': new Date().toISOString(),
        'paypal-cert-url': '',
        'paypal-auth-algo': 'SHA256withRSA',
        'paypal-transmission-sig': '',
      },
      body: rawBody,
    });

    const responseData = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: responseData.error || 'Webhook handler returned error' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Simulation for "${action}" sent successfully`,
      event: eventType,
      subscriptionId: mockSubscriptionId,
      data: responseData,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
