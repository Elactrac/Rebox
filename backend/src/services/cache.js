/**
 * Redis Cache Service for ReBox
 * Provides caching functionality with Redis or in-memory fallback
 */

const Redis = require('ioredis');

// Check if Redis is configured
const REDIS_URL = process.env.REDIS_URL;
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';

// Default TTL values (in seconds)
const DEFAULT_TTL = 300; // 5 minutes
const TTL_CONFIG = {
  short: 60,      // 1 minute
  medium: 300,    // 5 minutes
  long: 3600,     // 1 hour
  day: 86400,     // 24 hours
};

let redisClient = null;
let inMemoryCache = new Map();

// Initialize Redis client
const initializeCache = () => {
  if (!CACHE_ENABLED) {
    console.log('[Cache] Caching disabled');
    return null;
  }

  if (REDIS_URL) {
    try {
      redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      redisClient.on('connect', () => {
        console.log('[Cache] Redis connected');
      });

      redisClient.on('error', (err) => {
        console.error('[Cache] Redis error:', err.message);
      });

      redisClient.on('close', () => {
        console.log('[Cache] Redis connection closed');
      });

      redisClient.connect().catch(err => {
        console.error('[Cache] Failed to connect to Redis:', err.message);
        console.log('[Cache] Falling back to in-memory cache');
        redisClient = null;
      });

      return redisClient;
    } catch (error) {
      console.error('[Cache] Failed to initialize Redis:', error.message);
      return null;
    }
  } else {
    console.log('[Cache] No Redis URL configured, using in-memory cache');
    return null;
  }
};

// Clean up in-memory cache periodically
const cleanupInMemoryCache = () => {
  const now = Date.now();
  for (const [key, { expiry }] of inMemoryCache.entries()) {
    if (expiry && expiry < now) {
      inMemoryCache.delete(key);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupInMemoryCache, 60000);

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
const get = async (key) => {
  if (!CACHE_ENABLED) return null;

  try {
    if (redisClient && redisClient.status === 'ready') {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } else {
      const cached = inMemoryCache.get(key);
      if (cached) {
        if (!cached.expiry || cached.expiry > Date.now()) {
          return cached.value;
        }
        inMemoryCache.delete(key);
      }
      return null;
    }
  } catch (error) {
    console.error('[Cache] Get error:', error.message);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!CACHE_ENABLED) return false;

  try {
    const serialized = JSON.stringify(value);

    if (redisClient && redisClient.status === 'ready') {
      await redisClient.setex(key, ttl, serialized);
    } else {
      inMemoryCache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000),
      });
    }
    return true;
  } catch (error) {
    console.error('[Cache] Set error:', error.message);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key or pattern
 * @returns {Promise<boolean>} - Success status
 */
const del = async (key) => {
  if (!CACHE_ENABLED) return false;

  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.del(key);
    } else {
      inMemoryCache.delete(key);
    }
    return true;
  } catch (error) {
    console.error('[Cache] Delete error:', error.message);
    return false;
  }
};

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "user:*")
 * @returns {Promise<number>} - Number of keys deleted
 */
const delPattern = async (pattern) => {
  if (!CACHE_ENABLED) return 0;

  try {
    if (redisClient && redisClient.status === 'ready') {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return keys.length;
    } else {
      let deleted = 0;
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      for (const key of inMemoryCache.keys()) {
        if (regex.test(key)) {
          inMemoryCache.delete(key);
          deleted++;
        }
      }
      return deleted;
    }
  } catch (error) {
    console.error('[Cache] Delete pattern error:', error.message);
    return 0;
  }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} - Success status
 */
const clear = async () => {
  if (!CACHE_ENABLED) return false;

  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.flushdb();
    } else {
      inMemoryCache.clear();
    }
    return true;
  } catch (error) {
    console.error('[Cache] Clear error:', error.message);
    return false;
  }
};

/**
 * Get or set with callback (cache-aside pattern)
 * @param {string} key - Cache key
 * @param {Function} callback - Function to get value if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fetched value
 */
const getOrSet = async (key, callback, ttl = DEFAULT_TTL) => {
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }

  const value = await callback();
  await set(key, value, ttl);
  return value;
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
const getStats = async () => {
  if (!CACHE_ENABLED) {
    return { enabled: false };
  }

  try {
    if (redisClient && redisClient.status === 'ready') {
      const info = await redisClient.info('memory');
      const dbSize = await redisClient.dbsize();
      return {
        enabled: true,
        type: 'redis',
        status: redisClient.status,
        keys: dbSize,
        memory: info,
      };
    } else {
      return {
        enabled: true,
        type: 'in-memory',
        keys: inMemoryCache.size,
      };
    }
  } catch (error) {
    return {
      enabled: true,
      type: 'unknown',
      error: error.message,
    };
  }
};

// Cache key generators
const keys = {
  user: (id) => `user:${id}`,
  userStats: (id) => `user:${id}:stats`,
  packages: (userId, page = 1) => `packages:${userId}:page:${page}`,
  package: (id) => `package:${id}`,
  pickups: (userId, page = 1) => `pickups:${userId}:page:${page}`,
  pickup: (id) => `pickup:${id}`,
  rewards: (userId) => `rewards:${userId}`,
  leaderboard: () => 'leaderboard',
  globalImpact: () => 'impact:global',
  filterOptions: () => 'filters:options',
  adminStats: () => 'admin:stats',
};

// Initialize on module load
initializeCache();

module.exports = {
  get,
  set,
  del,
  delPattern,
  clear,
  getOrSet,
  getStats,
  keys,
  TTL_CONFIG,
  initializeCache,
};
