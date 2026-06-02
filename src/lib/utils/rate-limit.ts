// ================================================================
// Zero-Dependency Upstash Redis REST Rate Limiter
// ================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
}

/**
 * Perform rate limiting using direct Upstash Redis REST HTTP calls.
 * Works seamlessly in serverless (Vercel) environments without bulky dependencies.
 * Falls back to letting requests pass if Upstash is not configured.
 */
export async function rateLimit(
  ip: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.startsWith('your_') || !url.startsWith('http')) {
    // If rate limiting is not configured, silently pass
    return { success: true, limit, remaining: limit };
  }

  const key = `ratelimit:${ip}`;

  try {
    // Lua script to check and increment token usage atomically
    const luaScript = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local current = tonumber(redis.call('get', key) or "0")
      if current >= limit then
        return {0, limit - current}
      else
        local next_val = redis.call('incr', key)
        if next_val == 1 then
          redis.call('expire', key, window)
        end
        return {1, limit - next_val}
      end
    `;

    const res = await fetch(`${url}/eval`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: luaScript,
        args: [limit.toString(), windowSeconds.toString()],
        keys: [key],
      }),
    });

    if (!res.ok) {
      throw new Error(`Upstash REST returned status ${res.status}`);
    }

    const data = await res.json();
    
    // Result array returned from Lua eval: [success (0 or 1), remaining]
    const [successCode, remaining] = data.result as [number, number];

    return {
      success: successCode === 1,
      limit,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('Rate limiting error (passing request):', error);
    // Standard fail-open pattern to prevent blocking users on infrastructure failure
    return { success: true, limit, remaining: 1 };
  }
}
