const config = require('./config.js');

const Redis = require('redis');
const redis = Redis.createClient({
    prefix: config.redisPrefix
});

const { promisify } = require('util');

const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);
const delAsync = promisify(redis.del).bind(redis);

module.exports = { redisInstance: redis, getAsync, setAsync, delAsync };