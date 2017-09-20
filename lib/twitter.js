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
    const { data: user, errors } = await this.getUserData(oAuthAccessToken, oAuthAccessTokenSecret)
    return {
      data: {
        oAuthAccessToken,
        oAuthAccessTokenSecret,
        user
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
      data = JSON.parse(result[0])
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
    let data
    try {
      const result = await this.oauth.getAsync(
        `${ API_BASE }1.1/mutes/users/ids.json`,
        accessToken,
        accessTokenSecret
      )
      data = JSON.parse(result[0])
    } catch (error) {
      return {
        errors: error
      }
    }
    return {
      data
    }
  }
  async fetchTweets (accessToken, accessTokenSecret, userId) {
    let data
    try {
      const result = await this.oauth.getAsync(
        `${ API_BASE }1.1/statuses/home_timeline.json`,
        accessToken,
        accessTokenSecret
      )
      data = JSON.parse(result[0])
    } catch (error) {
      return {
        errors: error
      }
    }
    const { data: muted, errors } = await this.getMuted(accessToken, accessTokenSecret)
    const tweets = this.filterSelf(
                      this.filterQuotes(
                          this.filterRTs(
                              this.filterMuted(data, muted)
                          )
                      ),
                      userId
                    )
    return {
      data: tweets
    }
  }
  filterMuted (tweets, { ids }) {
    return tweets.filter(tweet => {
      const { user: { id } } = tweet
      return !ids.includes(id)
    })
  }
  filterRTs (tweets) { return tweets.filter(tweet => !tweet.retweeted_status) }
  filterQuotes (tweets) { return tweets.filter(tweet => !tweet.is_quote_status) }
  filterSelf (tweets, userId) { return tweets.filter(tweet => tweet.user.id !== userId) }
}
