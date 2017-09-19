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
    try {
      const [ oAuthToken, oAuthTokenSecret ] = await this.oauth.getOAuthRequestTokenAsync()  
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
    try {
      const [ oAuthAccessToken, oAuthAccessTokenSecret ] = await this.oauth.getOAuthAccessTokenAsync(
        token,
        tokenSecret,
        verifier
      )  
    } catch (error) {
      return {
        errors: error
      }
    }
    const { user } = await this.getUserData(oAuthAccessToken, oAuthAccessTokenSecret)
    return {
      data: {
        oAuthAccessToken,
        oAuthAccessTokenSecret,
        user
      }
    }
  }
  async getUserData (accessToken, accessTokenSecret) {
    try {
      const data = await this.oauth.getAsync(
        `${ API_BASE }1.1/account/verify_credentials.json`,
        accessToken,
        accessTokenSecret
      )  
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
