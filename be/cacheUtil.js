const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
console.log("Cache initialized with TTL 600s and check period 120s");

function getCacheKey(endpoint, requestData, method) {
    let keyData = requestData;

    // If the method is POST, use the body of the request for cache key
    if (method === 'POST' && requestData.body) {
        keyData = requestData.body;
    }

    const sortedDataString = JSON.stringify(keyData, (key, value) =>
        // Sort the object keys if the value is an object
        (typeof value === 'object' && value !== null) ? Object.keys(value).sort().reduce((sorted, key) => {
            sorted[key] = value[key];
            return sorted;
        }, {}) : value
    );

    return `${endpoint}:${sortedDataString}:${method}`;
}


function getCachedData(key) {
    const data = cache.get(key);
    if (!data) {
        console.log(`Cache miss for key: ${key}`);
    }
    return data;
}

function setCachedData(key, data) {
    const success = cache.set(key, data);
    if (!success) {
        console.error(`Failed to set data in cache for key: ${key}`);
    }
}

async function withCache(asyncFn, endpoint, data, method) {
    const cacheKey = getCacheKey(endpoint, data, method);
    let cachedData = getCachedData(cacheKey);

    if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
    } else {
        console.log(`Cache miss for ${cacheKey}`);
        const result = await asyncFn(endpoint, data, method);
        setCachedData(cacheKey, result);
        return result;
    }
}


module.exports = {
    getCacheKey,
    getCachedData,
    setCachedData,
    withCache
};
