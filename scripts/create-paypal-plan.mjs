#!/usr/bin/env node
// ================================================================
// create-paypal-plan.mjs
// Run with: node scripts/create-paypal-plan.mjs
//
// This script:
//  1. Gets a PayPal access token (live)
//  2. Creates a Product called "DevDistro Pro"
//  3. Creates a Billing Plan at $9/month under that product
//  4. Prints the Plan ID — copy it to PAYPAL_PLAN_ID in .env.local
// ================================================================

const CLIENT_ID   = 'AeVNyNd1dbzT-IRFNcuj2xXb2XDD0osOaxWqP5wf8tbcJ1GOuFWBHo3OLPzgL5wVG85AyAGM79S7E1G5';
const CLIENT_SECRET = 'ED5QpL6EWPOPR_57uBMpKDYWJiqnR60P3lvb2w0iKsgmecmWFnWnFZ-YKj5UaqtLXIZ3217VUgU-KCAg';
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // sandbox

// ── Step 1: Get access token ────────────────────────────────────
async function getToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Token error:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log('✅ Got access token');
  return data.access_token;
}

// ── Step 2: Create Product ──────────────────────────────────────
async function createProduct(token) {
  const res = await fetch(`${BASE_URL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `devdistro-product-${Date.now()}`,
    },
    body: JSON.stringify({
      name: 'DevDistro Pro',
      description: 'Unlimited AI-powered distribution plans for indie developers',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Product creation error:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(`✅ Created Product: ${data.id} (${data.name})`);
  return data.id;
}

// ── Step 3: Create Billing Plan ─────────────────────────────────
async function createPlan(token, productId) {
  const res = await fetch(`${BASE_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `devdistro-plan-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: 'Pro Monthly',
      description: 'DevDistro Pro — unlimited distribution plans',
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 = infinite (until cancelled)
          pricing_scheme: {
            fixed_price: {
              value: '9',
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Plan creation error:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

// ── Main ────────────────────────────────────────────────────────
(async () => {
  console.log('\n🚀 Creating PayPal Product + Plan for DevDistro...\n');

  const token     = await getToken();
  const productId = await createProduct(token);
  const plan      = await createPlan(token, productId);

  console.log('\n════════════════════════════════════════════');
  console.log('✅ SUCCESS! Copy this into your .env.local:');
  console.log('════════════════════════════════════════════');
  console.log(`\nPAYPAL_PLAN_ID=${plan.id}\n`);
  console.log('════════════════════════════════════════════\n');
})();
