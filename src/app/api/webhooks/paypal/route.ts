// ================================================================
// PayPal Webhook Handler
// ================================================================
// Receives and processes PayPal subscription lifecycle events.
// Every event is verified against PayPal's signature API before
// any database changes are made.
// ================================================================
//
// Events handled:
//   BILLING.SUBSCRIPTION.ACTIVATED   → plan_tier = 'pro'
//   BILLING.SUBSCRIPTION.UPDATED     → update period end
//   BILLING.SUBSCRIPTION.CANCELLED   → plan_tier = 'free'
//   BILLING.SUBSCRIPTION.SUSPENDED   → plan_tier = 'free'
//   BILLING.SUBSCRIPTION.EXPIRED     → plan_tier = 'free'
//   PAYMENT.SALE.COMPLETED           → logged (optional receipt emails)
// ================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPayPalWebhook } from '@/lib/payments/paypal';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // ── 1. Verify webhook signature ──────────────────────────────
    const isValid = await verifyPayPalWebhook(request.headers, rawBody);
    if (!isValid) {
      console.warn('PayPal webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event_type;
    const resource = event.resource ?? {};

    console.log(`PayPal webhook received: ${eventType}`);

    const supabase = createAdminClient();

    // ── 2. Route by event type ───────────────────────────────────
    switch (eventType) {

      // ── Subscription Activated ───────────────────────────────
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const userId: string | undefined = resource.custom_id;
        if (!userId) {
          console.warn('BILLING.SUBSCRIPTION.ACTIVATED: no custom_id in resource');
          break;
        }

        const subscriptionId: string = resource.id;
        const payerId: string | undefined = resource.subscriber?.payer_id;
        const nextBillingTime: string | undefined = resource.billing_info?.next_billing_time;

        // Upsert subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              paypal_payer_id: payerId ?? null,
              paypal_subscription_id: subscriptionId,
              status: 'active',
              plan_name: 'Pro Plan',
              current_period_end: nextBillingTime ? new Date(nextBillingTime).toISOString() : null,
            },
            { onConflict: 'paypal_subscription_id' }
          );

        if (subError) throw subError;

        // Upgrade user tier
        const { error: userError } = await supabase
          .from('users')
          .update({ plan_tier: 'pro' })
          .eq('id', userId);

        if (userError) throw userError;

        console.log(`User ${userId} upgraded to Pro (subscription ${subscriptionId})`);
        break;
      }

      // ── Subscription Updated ──────────────────────────────────
      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const subscriptionId: string = resource.id;
        const nextBillingTime: string | undefined = resource.billing_info?.next_billing_time;

        if (nextBillingTime) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ current_period_end: new Date(nextBillingTime).toISOString() })
            .eq('paypal_subscription_id', subscriptionId);

          if (error) throw error;
        }
        break;
      }

      // ── Subscription Cancelled / Suspended / Expired ──────────
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId: string = resource.id;
        const userId: string | undefined = resource.custom_id;

        // Update subscription status
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('paypal_subscription_id', subscriptionId);

        if (subError) throw subError;

        // Downgrade user — use custom_id if available, else look up by subscription_id
        if (userId) {
          const { error: userError } = await supabase
            .from('users')
            .update({ plan_tier: 'free' })
            .eq('id', userId);

          if (userError) throw userError;
        } else {
          // Fallback: find user via subscriptions table
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('paypal_subscription_id', subscriptionId)
            .maybeSingle();

          if (sub?.user_id) {
            const { error: userError } = await supabase
              .from('users')
              .update({ plan_tier: 'free' })
              .eq('id', sub.user_id);

            if (userError) throw userError;
          }
        }

        console.log(`Subscription ${subscriptionId} ${eventType} — user downgraded to Free`);
        break;
      }

      // ── Payment Completed (log only) ──────────────────────────
      case 'PAYMENT.SALE.COMPLETED': {
        const amount = resource.amount?.total;
        const currency = resource.amount?.currency;
        console.log(`PayPal payment received: ${currency} ${amount}`);
        // Add receipt email logic here if needed
        break;
      }

      default:
        console.log(`PayPal webhook: unhandled event type "${eventType}" — ignoring`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
