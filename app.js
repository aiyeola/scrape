"use strict";
require("dotenv").config();

const process = require("node:process");
const redis = require("redis");
const cron = require("node-cron");
const express = require("express");

const { crawlData } = require("./crawler");
const { makeRequest } = require("./ping");
const { sendMail, formatMail } = require("./mail");
const { pushTweetToTwitter } = require("./handlers");

const KEY = "news";
const port = process.env.PORT || 8080;

const app = express();

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

    const html = formatMail(difference);

    sendMail(html);
    pushTweetToTwitter(difference);

    await client.disconnect();

    console.log("This script ran for", process.uptime(), "seconds");
  } catch (error) {
    console.log("script error: ", error);
  }
};

app.get("/", (_req, res) => {
  console.log("app is running: ping");
  res.send("App is running");
});

app.get("/get-news", getTrendingNews);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

cron.schedule("*/30 4-19 * * 1-5", getTrendingNews);

cron.schedule("*/14 * * * *", makeRequest);
