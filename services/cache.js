const mongoose = require('mongoose');
const util = require('util');
const redis = require('redis');
const keys = require('../config/keys');

const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || "");
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    console.log("this.hashKey " + this.hashKey);
    console.log("key " + key);

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result), "EX", 100);
    return result;
}

module.exports = {
    clearHash (hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
