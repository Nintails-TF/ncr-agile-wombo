const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
console.log("Cache initialized with TTL 600s and check period 120s");

function getCacheKey(endpoint, data, method) {
    const sortedDataString = JSON.stringify(data, Object.keys(data).sort());
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

module.exports = {
    getCacheKey,
    getCachedData,
    setCachedData
};
