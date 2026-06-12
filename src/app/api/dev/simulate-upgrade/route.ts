import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  // Only allow this endpoint in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const { userId, email, action } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || 'your_webhook_secret';
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID || '12345';
    const supabase = createAdminClient();

    let eventName = 'subscription_created';
    let status = 'active';
    let subscriptionId = 'mock_sub_' + Math.floor(Math.random() * 1000000);

    if (action === 'cancel') {
      eventName = 'subscription_cancelled';
      status = 'cancelled';

      // Try to find the user's existing subscription to cancel it properly
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('lemon_subscription_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSub) {
        subscriptionId = existingSub.lemon_subscription_id;
      }
    }

    // Construct a realistic Lemon Squeezy subscription webhook payload
    const mockPayload = {
      meta: {
        event_name: eventName,
        custom_data: {
          user_id: userId,
        },
      },
      data: {
        id: subscriptionId,
        type: 'subscriptions',
        attributes: {
          store_id: 1111,
          customer_id: 2222,
          status: status,
          variant_name: 'Pro Plan',
          variant_id: parseInt(variantId) || 12345,
          renews_at: action === 'upgrade' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          ends_at: action === 'cancel' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
        },
      },
    };

    const rawBody = JSON.stringify(mockPayload);

    // Compute signature using the local secret
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(rawBody).digest('hex');

    // Send request locally to our actual webhook handler
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/webhooks/lemonsqueezy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
      },
      body: rawBody,
    });

    const responseData = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: responseData.error || 'Webhook handler returned error status',
      }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: `Simulation for ${action} sent successfully`, data: responseData });
  } catch (error: unknown) {
    console.error('Simulation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
