require("dotenv").config();

const process = require("node:process");
const redis = require("redis");
const cron = require("node-cron");

const { crawlData } = require("./crawler");
const { sendMail } = require("./mail");

const KEY = "news";

const getTrendingNews = async () => {
  try {
    const client = await redis
      .createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    const news = await crawlData();

    const value = await client.get(KEY);

    await client.set(KEY, JSON.stringify(news));

    const newsInDb = JSON.parse(value);

    const difference = news.filter(
      ({ link: link1 }) => !newsInDb.some(({ link: link2 }) => link2 === link1)
    );

    sendMail(difference);

    await client.disconnect();

    console.log("This script ran for", process.uptime(), "seconds");
  } catch (error) {
    console.log("script error: ", error);
  }
};

cron.schedule("*/30 5-20 * * 1-5", () => getTrendingNews());
