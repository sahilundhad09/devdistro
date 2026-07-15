// ================================================================
// PayPal Subscriptions — Core Payments Helper
// ================================================================
// Uses PayPal Subscriptions API v1 (server-side only).
// All calls are server-to-server using OAuth2 client credentials.
// ================================================================

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// ── Types ────────────────────────────────────────────────────────

export interface PayPalSubscription {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  subscriber?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  billing_info?: {
    next_billing_time?: string;
    last_payment?: {
      amount?: { value: string; currency_code: string };
      time?: string;
    };
  };
  links?: Array<{ href: string; rel: string; method: string }>;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  approvalUrl: string;
}

// ── OAuth2 Access Token ──────────────────────────────────────────

/**
 * Fetches a short-lived PayPal OAuth2 bearer token.
 * PayPal tokens expire in 9 hours; in production consider caching.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal token fetch failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

// ── Create Subscription ──────────────────────────────────────────

/**
 * Creates a PayPal subscription under the configured plan.
 * Returns the subscription ID and the PayPal-hosted approval URL
 * that you redirect the user to.
 *
 * @param userId  - Your internal Supabase user ID (stored in custom_id)
 * @param returnUrl - URL PayPal redirects to after the user approves
 * @param cancelUrl - URL PayPal redirects to if the user cancels
 */
export async function createSubscription(
  userId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<CreateSubscriptionResult> {
  const planId = process.env.PAYPAL_PLAN_ID;
  if (!planId) throw new Error('PAYPAL_PLAN_ID is not configured.');

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'PayPal-Request-Id': `devdistro-sub-${userId}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId, // stored on every webhook event — used to identify user
      application_context: {
        brand_name: 'DevDistro',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal create subscription failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const subscriptionId: string = data.id;

  // Find the approval link from PayPal's HATEOAS links
  const approvalLink = (data.links as Array<{ href: string; rel: string }>).find(
    (l) => l.rel === 'approve'
  );

  if (!approvalLink) {
    throw new Error('PayPal did not return an approval URL.');
  }

  return { subscriptionId, approvalUrl: approvalLink.href };
}

// ── Get Subscription Details ─────────────────────────────────────

/**
 * Fetches full details of a PayPal subscription by ID.
 * Use this on the capture/return URL to confirm status is APPROVED or ACTIVE.
 */
export async function getSubscription(
  subscriptionId: string
): Promise<PayPalSubscription> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal get subscription failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<PayPalSubscription>;
}

// ── Cancel Subscription ──────────────────────────────────────────

/**
 * Cancels an active PayPal subscription.
 * PayPal will send a BILLING.SUBSCRIPTION.CANCELLED webhook after this.
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason = 'User requested cancellation'
): Promise<void> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    }
  );

  // 204 No Content = success
  if (response.status !== 204 && !response.ok) {
    const text = await response.text();
    throw new Error(`PayPal cancel subscription failed (${response.status}): ${text}`);
  }
}

// ── Verify Webhook Signature ─────────────────────────────────────

/**
 * Verifies a PayPal webhook event using PayPal's own verification API.
 * This is more robust than local HMAC because PayPal handles cert rotation.
 *
 * @param headers  - Raw request headers from the incoming webhook
 * @param rawBody  - Raw request body string (before JSON.parse)
 * @returns true if the webhook is genuine
 */
export async function verifyPayPalWebhook(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn('PAYPAL_WEBHOOK_ID not set — skipping webhook verification.');
    return false;
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const verifyPayload = {
      auth_algo: headers.get('paypal-auth-algo') ?? '',
      cert_url: headers.get('paypal-cert-url') ?? '',
      transmission_id: headers.get('paypal-transmission-id') ?? '',
      transmission_sig: headers.get('paypal-transmission-sig') ?? '',
      transmission_time: headers.get('paypal-transmission-time') ?? '',
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    };

    const response = await fetch(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload),
      }
    );

    if (!response.ok) return false;

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
}
