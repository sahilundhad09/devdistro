// ================================================================
// Lemon Squeezy Payments Helper
// ================================================================

import crypto from 'crypto';

/**
 * Generates the direct checkout URL for Lemon Squeezy.
 * Passes the user's ID in the custom params to identify them in the webhook.
 */
export function getCheckoutUrl(userId: string, email: string): string {
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!variantId) {
    console.warn('LEMONSQUEEZY_VARIANT_ID is not configured.');
    return '#';
  }

  const baseUrl = `https://devdistro.lemonsqueezy.com/checkout/buy/${variantId}`;
  const params = new URLSearchParams({
    embed: '1',
    media: '0',
    logo: '0',
    'checkout[email]': email,
    'checkout[custom][user_id]': userId,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Verifies that the webhook request indeed came from Lemon Squeezy.
 * Uses crypto HMAC-SHA256 signature verification.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    // Use timingSafeEqual to protect against timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}
