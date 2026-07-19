/**
 * Simple In-Memory Cache Middleware
 * Dramatically speeds up GET requests by caching JSON responses.
 */

const cacheMap = new Map();

/**
 * Middleware to cache GET requests
 * @param {number} durationInSeconds - How long to keep the cache
 */
export const cacheMiddleware = (durationInSeconds) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key based on the original URL
        const key = req.originalUrl || req.url;
        
        // Exclude specific user or admin routes from caching
        if (key.includes('/auth') || 
            key.includes('/cart') || 
            key.includes('/wishlist') ||
            key.includes('/reviews/me') ||
            key.includes('/orders')) {
            return next();
        }

        const cachedItem = cacheMap.get(key);

        if (cachedItem && cachedItem.expiry > Date.now()) {
            res.setHeader('Content-Type', 'application/json');
            return res.send(cachedItem.body);
        }

        // Store original send/json functions
        const originalSend = res.send.bind(res);
        const originalJson = res.json.bind(res);

        // Override send to intercept and cache the response
        res.send = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cacheMap.set(key, {
                    body,
                    expiry: Date.now() + (durationInSeconds * 1000)
                });
            }
            return originalSend(body);
        };
        
        // Override json to intercept and cache the response
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
                cacheMap.set(key, {
                    body: bodyStr,
                    expiry: Date.now() + (durationInSeconds * 1000)
                });
            }
            return originalJson(body);
        };

        next();
    };
};

/**
 * Flush the entire cache when data updates (e.g. products, categories, orders)
 */
export const clearCache = () => {
    cacheMap.clear();
    console.log('API Cache Cleared');
};
