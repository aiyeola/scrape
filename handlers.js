const { TwitterApi } = require("twitter-api-v2");
// const { Client, auth } = require("twitter-api-sdk");

const client = new TwitterApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const CALLBACK_URL = `${process.env.SERVICE_URL}callback`;

async function login(req, res) {
  // Don't forget to specify 'offline.access' in scope list if you want to refresh your token later
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    CALLBACK_URL,
    { scope: ["tweet.read", "tweet.write", "offline.access"] }
  );

  // Redirect your user to {url}, store {state} and {codeVerifier} into a DB/Redis/memory after user redirection
  req.session.state = state;
  req.session.codeVerifier = codeVerifier;

  res.redirect(url);
}

async function callback(req, res) {
  // Extract state and code from query string
  const { state, code } = req.query;
  // Get the saved codeVerifier from session
  const { codeVerifier, state: sessionState } = req.session;

  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send("You denied the app or your session expired!");
  }
  if (state !== sessionState) {
    return res.status(400).send("Stored tokens didn't match!");
  }

  client
    .loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
    .then(async ({ accessToken, refreshToken, client: loggedClient }) => {
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      // Example request
      const { data: userObject } = await loggedClient.v2.me();
      console.log("userObject: ", userObject);
    })
    .catch(() => res.status(403).send("Invalid verifier or access tokens!"));
}

async function postTweet(req, res) {
  //   const twitterApi = new TwitterApi(
  //     "Bearer c0tqcnBqUDEyUDdqaGJwZjV3bDBoODdjV2x6NXNGX0hhYTF6dEhWcHlpX1V4OjE3MDEwNDYxOTAwNjU6MToxOmF0OjE"
  //   );

  const dd = await client.currentUserV2();
  console.log("dd: ", dd);
  //   const { data: createdTweet } = await twitterApi.v2.readWrite.tweet(
  //     "twitter-api-v2 is awesome!",
  //     {
  //       poll: {
  //         duration_minutes: 120,
  //         options: ["Absolutely", "For sure!"],
  //       },
  //     }
  //   );
  //   console.log("Tweet", createdTweet.id, ":", createdTweet.text);
}

async function refreshToken(req, res) {
  const client = new TwitterApi({
    clientId: "<YOUR-CLIENT-ID>",
    clientSecret: "<YOUR-CLIENT-SECRET>",
  });

  // Obtain the {refreshToken} from your DB/store
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await client.refreshOAuth2Token(refreshToken);

  // Store refreshed {accessToken} and {newRefreshToken} to replace the old ones

  // Example request
  await refreshedClient.v2.me();
}

module.exports = {
  login,
  callback,
  postTweet,
  refreshToken,
};
// const authClient = new auth.OAuth2User({
//   client_id: process.env.CLIENT_ID,
//   client_secret: process.env.CLIENT_SECRET,
//   // callback: "http://127.0.0.1:8080/callback",
//   callback: "https://mimi-scrape.onrender.com/callback",
//   scopes: ["tweet.read", "tweet.write"],
// });
//
// const client = new Client(authClient);
//
// const STATE = "my-state";
//
// app.get("/callback2", async function (req, res) {
//   try {
//     const { code, state } = req.query;
//     if (state !== STATE) return res.status(500).send("State isn't matching");
//     const accessToken = await authClient.requestAccessToken(code);
//     console.log("accessToken: ", accessToken);
//     // res.redirect("/tweets");
//   } catch (error) {
//     console.log(error);
//   }
// });
//
// app.get("/login", async function (req, res) {
//   const authUrl = authClient.generateAuthURL({
//     state: STATE,
//     code_challenge_method: "s256",
//   });
//   res.redirect(authUrl);
// });
//
// app.get("/tweets", async function (req, res) {
//   const makeTweet = await client.tweets.createTweet({
//     text: "Hello, world!",
//   });
//   const tweets = await client.tweets.findTweetById("1381859574467203074");
//   res.send(tweets.data);
// });
//
// app.get("/revoke", async function (req, res) {
//   try {
//     const response = await authClient.revokeAccessToken();
//     res.send(response);
//   } catch (error) {
//     console.log(error);
//   }
// });
