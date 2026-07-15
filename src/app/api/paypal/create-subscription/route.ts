// ================================================================
// POST /api/paypal/create-subscription
// ================================================================
// Authenticated server route. Creates a PayPal subscription for
// the logged-in user and returns the PayPal-hosted approval URL.
//
// The client redirects the user to that URL. After approval,
// PayPal redirects back to /api/paypal/capture.
// ================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/payments/paypal';

export async function POST() {
  try {
    // ── 1. Verify the user is authenticated ─────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Check they aren't already Pro ────────────────────────
    const { data: profile } = await supabase
      .from('users')
      .select('plan_tier')
      .eq('id', user.id)
      .single();

    if (profile?.plan_tier === 'pro') {
      return NextResponse.json(
        { error: 'Already on Pro plan' },
        { status: 400 }
      );
    }

    // ── 3. Build return / cancel URLs ────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/api/paypal/capture`;
    const cancelUrl = `${appUrl}/settings?cancelled=true`;

    // ── 4. Create the PayPal subscription ───────────────────────
    const { subscriptionId, approvalUrl } = await createSubscription(
      user.id,
      returnUrl,
      cancelUrl
    );

    console.log(`Created PayPal subscription ${subscriptionId} for user ${user.id}`);

    return NextResponse.json({ approvalUrl, subscriptionId });
  } catch (error) {
    console.error('Create PayPal subscription error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
