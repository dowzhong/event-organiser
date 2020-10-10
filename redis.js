const Redis = require('redis');
const redis = Redis.createClient();

const { promisify } = require('util');

const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);

module.exports = { redisInstance: redis, getAsync, setAsync };