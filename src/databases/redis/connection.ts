import Redis from "ioredis";
import { promisify } from "util";

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

async function setRedis(key: string, value: string) {
  return redisClient.set(key, value, "ex", 60); // "ex", 60 = expires in 60 seconds
}

async function getRedis(key: string) {
  const getRedisAsync = promisify(redisClient.get).bind(redisClient);
  const response = await getRedisAsync(key);
  return JSON.parse(response as string);
}

export default {
  setRedis,
  getRedis,
};