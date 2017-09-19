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

const API_BASE = 'https://api.twitter.com/'

module.exports = class Twitter {
  constructor() {
    this.oauth = new OAuth(
      `${ API_BASE }oauth/request_token`,
      `${ API_BASE }oauth/access_token`,
      TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET,
      "1.0A",
      TWITTER_CALLBACK_URL,
      "HMAC-SHA1"
    )
  }
  async getOAuthRequestToken () {
    let oAuthToken, oAuthTokenSecret
    try {
      const result = await this.oauth.getOAuthRequestTokenAsync()
      oAuthToken = result[0]
      oAuthTokenSecret = result[1]
    } catch (error) {
      return {
        errors: error
      }
    }
    return {
      data: {
        oAuthToken,
        oAuthTokenSecret
      }
    }
  }
  async getOAuthAccessToken (token, tokenSecret, verifier) {
    let oAuthAccessToken, oAuthAccessTokenSecret
    try {
      const result = await this.oauth.getOAuthAccessTokenAsync(
        token,
        tokenSecret,
        verifier
      )
      oAuthAccessToken = result[0]
      oAuthAccessTokenSecret = result[1]
    } catch (error) {
      return {
        errors: error
      }
    }
    const { data: user } = await this.getUserData(oAuthAccessToken, oAuthAccessTokenSecret)
    return {
      data: {
        oAuthAccessToken,
        oAuthAccessTokenSecret,
        user: JSON.parse(user)
      }
    }
  }
  async getUserData (accessToken, accessTokenSecret) {
    let data
    try {
      const result = await this.oauth.getAsync(
        `${ API_BASE }1.1/account/verify_credentials.json`,
        accessToken,
        accessTokenSecret
      )
      data = result[0]
    } catch (error) {
      return {
        errors: error
      }
    }
    return {
      data
    }
  }
  async getMuted (accessToken, accessTokenSecret) {
    const data = await this.oauth.get(
      `${ API_BASE }1.1/mutes/users/ids.json`,
      accessToken,
      accessTokenSecret
    )
    return {
      data
    }
  }
}
