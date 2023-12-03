const { TwitterApi } = require("twitter-api-v2");

const pushTweetToTwitter = async (data) => {
  if (data.length) {
    let i = 0;
    const twitterApi = new TwitterApi({
      appKey: process.env.API_KEY,
      appSecret: process.env.API_KEY_SECRET,
      accessToken: process.env.ACCESS_TOKEN,
      accessSecret: process.env.ACCESS_TOKEN_SECRET,
    });

    let timerId = setInterval(async () => {
      let { link, title } = data[i];
      await twitterApi.v2.tweet(`${title} \n ${link}`);

      i = i + 1;
      if (i >= data.length) {
        console.log("tweets posted ✅");
        clearInterval(timerId);
      }
    }, 30000);
  } else {
    console.log("no tweets to post 🫠");
  }
};
module.exports = { pushTweetToTwitter };
