const url = require("url");
const querystring = require("querystring");

const Twitter = require("./twitter");

const handler = type => {
  return {
    oauth_request: async ({ cb }) => {
      const twitter = new Twitter(cb);
      return await twitter.getOAuthRequestToken();
    },
    auth_token: async ({ token, tokenSecret, verifier, cb }) => {
      const twitter = new Twitter(cb);
      return await twitter.getOAuthAccessToken(token, tokenSecret, verifier);
    },
    tweets: async ({
      accessToken,
      accessTokenSecret,
      userId,
      latestId,
      cb
    }) => {
      const twitter = new Twitter(cb);
      return await twitter.fetchTweets(
        accessToken,
        accessTokenSecret,
        userId,
        latestId
      );
    }
  }[type];
};

module.exports = class Router {
  async handle(req, body) {
    const { query } = url.parse(req.url);
    const params = querystring.parse(query);
    const { type } = params;
    const args = { ...body, ...req.headers };
    const method = handler(type);
    if (!method) {
      return {
        errors: {
          status: 404
        }
      };
    }
    try {
      const { data, errors } = await method(args);
      return {
        data,
        errors
      };
    } catch (error) {
      return {
        errors: error
      };
    }
  }
};
