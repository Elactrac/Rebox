/**
 * Rate Limiting Middleware for ReBox API
 * Protects against brute force attacks and API abuse
 */

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Create a rate limiter with custom options
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests
 * @param {function} options.keyGenerator - Custom key generator function
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 100, // 100 requests per window default
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skipFailedRequests = false,
    headers = true,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Add rate limit headers
    if (headers) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count - 1));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    // Handle skipSuccessfulRequests and skipFailedRequests
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalEnd = res.end;
      res.end = function (...args) {
        if (
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400)
        ) {
          record.count--;
          rateLimitStore.set(key, record);
        }
        return originalEnd.apply(this, args);
      };
    }

    next();
  };
};

// Pre-configured rate limiters for different use cases

// General API rate limiter - 100 requests per minute
const generalLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again after a minute.',
});

// Strict rate limiter for authentication endpoints - 5 requests per minute
const authLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again after a minute.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Login rate limiter - 10 attempts per 15 minutes
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60000, // 15 minutes
  maxRequests: 10,
  message: 'Too many login attempts, please try again after 15 minutes.',
  keyGenerator: (req) => {
    // Rate limit by IP + email combination for login
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.connection.remoteAddress;
    return `login:${ip}:${email}`;
  },
});

// Registration rate limiter - 3 registrations per hour per IP
const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60000, // 1 hour
  maxRequests: 3,
  message: 'Too many accounts created from this IP, please try again after an hour.',
});

// Password reset rate limiter - 3 requests per hour
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60000, // 1 hour
  maxRequests: 3,
  message: 'Too many password reset requests, please try again after an hour.',
});

// Upload rate limiter - 20 uploads per hour
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60000, // 1 hour
  maxRequests: 20,
  message: 'Upload limit reached, please try again after an hour.',
});

// API-intensive operations (reports, exports) - 10 per hour
const heavyOperationLimiter = createRateLimiter({
  windowMs: 60 * 60000, // 1 hour
  maxRequests: 10,
  message: 'Too many resource-intensive requests, please try again later.',
});

// Burst limiter for spam prevention - 10 requests per 10 seconds
const burstLimiter = createRateLimiter({
  windowMs: 10000, // 10 seconds
  maxRequests: 10,
  message: 'Slow down! Too many requests in a short time.',
});

// User-specific rate limiter (uses user ID instead of IP)
const createUserRateLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
      return req.ip || req.connection.remoteAddress;
    },
  });
};

// Rate limiter stats (for monitoring)
const getRateLimitStats = () => {
  const stats = {
    totalKeys: rateLimitStore.size,
    entries: [],
  };

  for (const [key, data] of rateLimitStore.entries()) {
    stats.entries.push({
      key,
      count: data.count,
      resetTime: new Date(data.resetTime).toISOString(),
    });
  }

  return stats;
};

// Clear rate limit for a specific key (admin function)
const clearRateLimit = (key) => {
  return rateLimitStore.delete(key);
};

// Clear all rate limits (admin function)
const clearAllRateLimits = () => {
  rateLimitStore.clear();
};

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  loginLimiter,
  registrationLimiter,
  passwordResetLimiter,
  uploadLimiter,
  heavyOperationLimiter,
  burstLimiter,
  createUserRateLimiter,
  getRateLimitStats,
  clearRateLimit,
  clearAllRateLimits,
};
