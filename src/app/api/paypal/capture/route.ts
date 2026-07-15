// ================================================================
// GET /api/paypal/capture
// ================================================================
// PayPal redirects users here after they approve the subscription.
// Query params from PayPal: subscription_id, ba_token, token
//
// This route:
//  1. Fetches the subscription from PayPal to confirm it's APPROVED
//  2. Upserts the subscription record in Supabase
//  3. Sets user plan_tier = 'pro'
//  4. Redirects to /settings?success=true
// ================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSubscription } from '@/lib/payments/paypal';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get('subscription_id');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // ── Guard: subscription_id must be present ───────────────────
  if (!subscriptionId) {
    console.warn('PayPal capture: missing subscription_id in query params');
    return NextResponse.redirect(`${appUrl}/settings?error=missing_subscription`);
  }

  try {
    // ── 1. Fetch subscription details from PayPal ────────────────
    const subscription = await getSubscription(subscriptionId);

    // Must be APPROVED or already ACTIVE to proceed
    if (
      subscription.status !== 'APPROVED' &&
      subscription.status !== 'ACTIVE'
    ) {
      console.warn(
        `PayPal capture: subscription ${subscriptionId} is in unexpected status "${subscription.status}"`
      );
      return NextResponse.redirect(`${appUrl}/settings?error=subscription_not_approved`);
    }

    // ── 2. Extract user ID (stored as custom_id when creating) ───
    // custom_id is returned as resource.custom_id in the subscription object.
    // PayPal API returns it at the top level on GET subscription.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSub = subscription as any;
    const userId: string | undefined = rawSub.custom_id;

    if (!userId) {
      console.error(`PayPal capture: no custom_id on subscription ${subscriptionId}`);
      return NextResponse.redirect(`${appUrl}/settings?error=no_user_id`);
    }

    const payerId: string | undefined = subscription.subscriber?.payer_id;
    const nextBillingTime: string | undefined = subscription.billing_info?.next_billing_time;

    const supabase = createAdminClient();

    // ── 3. Upsert subscription record ────────────────────────────
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          paypal_payer_id: payerId ?? null,
          paypal_subscription_id: subscriptionId,
          status: 'active',
          plan_name: 'Pro Plan',
          current_period_end: nextBillingTime
            ? new Date(nextBillingTime).toISOString()
            : null,
        },
        { onConflict: 'paypal_subscription_id' }
      );

    if (subError) throw subError;

    // ── 4. Upgrade the user's plan tier ─────────────────────────
    const { error: userError } = await supabase
      .from('users')
      .update({ plan_tier: 'pro' })
      .eq('id', userId);

    if (userError) throw userError;

    console.log(`PayPal capture: user ${userId} upgraded to Pro via subscription ${subscriptionId}`);

    // ── 5. Redirect to success ───────────────────────────────────
    return NextResponse.redirect(`${appUrl}/settings?success=true`);
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.redirect(`${appUrl}/settings?error=capture_failed`);
  }
}
