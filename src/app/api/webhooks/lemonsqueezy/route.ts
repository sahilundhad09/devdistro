// ================================================================
// Lemon Squeezy Webhook Handler
// ================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payments/lemonsqueezy';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

    // 1. Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    const userId = customData?.user_id;

    if (!userId) {
      console.warn('Webhook received without user_id in custom_data. Payload:', eventName);
      return NextResponse.json({ success: true, message: 'No user_id found, ignoring' });
    }

    const supabase = createAdminClient();

    const data = payload.data;
    const subscriptionId = data.id.toString();
    const attributes = data.attributes;
    const customerId = attributes.customer_id.toString();
    const status = attributes.status; // active | cancelled | past_due | expired etc.
    const planName = attributes.variant_name || 'Pro Plan';
    const currentPeriodEnd = attributes.renews_at || attributes.ends_at;

    // Map Lemon Squeezy status to DB subscription status
    let mappedStatus: 'active' | 'cancelled' | 'past_due' = 'active';
    if (status === 'cancelled' || status === 'expired' || status === 'unpaid') {
      mappedStatus = 'cancelled';
    } else if (status === 'past_due') {
      mappedStatus = 'past_due';
    }

    console.log(`Processing LS Webhook event ${eventName} for User ${userId}. Status: ${status}`);

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      // 1. Update/Insert Subscription in DB
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          lemon_customer_id: customerId,
          lemon_subscription_id: subscriptionId,
          status: mappedStatus,
          plan_name: planName,
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
        }, {
          onConflict: 'lemon_subscription_id',
        });

      if (subError) throw subError;

      // 2. Update user profile to Pro if active
      const userTier = mappedStatus === 'active' ? 'pro' : 'free';
      const { error: userError } = await supabase
        .from('users')
        .update({ plan_tier: userTier })
        .eq('id', userId);

      if (userError) throw userError;
    }

    else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      // 1. Update Subscription in DB
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
        })
        .eq('lemon_subscription_id', subscriptionId);

      if (subError) throw subError;

      // 2. Downgrade user profile to Free
      const { error: userError } = await supabase
        .from('users')
        .update({ plan_tier: 'free' })
        .eq('id', userId);

      if (userError) throw userError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
