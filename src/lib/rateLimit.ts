type RateRecord = {
  count: number;
  resetTime: number;
};

const rateMap = new Map<string, RateRecord>();

/**
 * In-memory rate limiter.
 * @param key Unique key to rate limit (e.g. email or IP)
 * @param maxRequests Maximum number of allowed requests in window
 * @param windowMs Time window in milliseconds (default 1 hour = 3600000 ms)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 3,
  windowMs: number = 3600000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateMap.set(key, newRecord);
    return { allowed: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  rateMap.set(key, record);
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}
