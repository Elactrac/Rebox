/**
 * Cache Middleware for ReBox API
 * Provides response caching for GET requests
 */

const cache = require('../services/cache');

/**
 * Cache middleware for GET requests
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {boolean} options.userSpecific - Include user ID in cache key
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = cache.TTL_CONFIG.medium,
    keyGenerator = null,
    userSpecific = false,
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const baseKey = req.originalUrl || req.url;
      cacheKey = userSpecific && req.user?.id 
        ? `api:${req.user.id}:${baseKey}`
        : `api:${baseKey}`;
    }

    try {
      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        // Add cache header
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('[Cache Middleware] Failed to cache response:', err);
          });
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('[Cache Middleware] Error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Clears cache when data is modified
 * @param {string|Array} patterns - Cache key patterns to invalidate
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const invalidate = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
        
        for (const pattern of patternsArray) {
          let keyPattern = pattern;
          
          // Replace placeholders with actual values
          keyPattern = keyPattern.replace(':userId', req.user?.id || '*');
          keyPattern = keyPattern.replace(':id', req.params?.id || '*');
          
          await cache.delPattern(keyPattern);
        }
      }
    };

    res.json = async (data) => {
      await invalidate();
      return originalJson(data);
    };

    res.send = async (data) => {
      await invalidate();
      return originalSend(data);
    };

    next();
  };
};

/**
 * User-specific cache middleware
 * Caches responses per user
 */
const userCache = (ttl = cache.TTL_CONFIG.medium) => {
  return cacheMiddleware({
    ttl,
    userSpecific: true,
  });
};

/**
 * Public cache middleware
 * Caches responses globally (not user-specific)
 */
const publicCache = (ttl = cache.TTL_CONFIG.medium) => {
  return cacheMiddleware({
    ttl,
    userSpecific: false,
  });
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  userCache,
  publicCache,
};
