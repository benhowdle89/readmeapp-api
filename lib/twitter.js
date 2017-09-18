const Promise = require('bluebird')
const OAuth = Promise.promisifyAll(require('oauth'), {
  multiArgs: true
}).OAuth

const {
  PORT = 3000,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_CALLBACK_URL
} = process.env

module.exports = class Twitter {
  constructor() {
    this.oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET,
      "1.0A",
      TWITTER_CALLBACK_URL,
      "HMAC-SHA1"
    )
  }
  async getOAuthRequestToken () {
    const [ oAuthToken, oAuthTokenSecret ] = await this.oauth.getOAuthRequestTokenAsync()
    return {
      data: {
        oAuthToken,
        oAuthTokenSecret
      }
    }
  }
  async getOAuthAccessToken (token, tokenSecret, verifier) {
    const [ oAuthAccessToken, oAuthAccessTokenSecret ] = await this.oauth.getOAuthAccessToken(
      token,
      tokenSecret,
      verifier
    )
    return {
      data: {
        oAuthAccessToken,
        oAuthAccessTokenSecret
      }
    }
  }
  async getUserData (token, tokenSecret) {
    const data = await this.oauth.get(
      "https://api.twitter.com/1.1/account/verify_credentials.json",
      token,
      tokenSecret
    )
    return {
      data
    }
  }
}
