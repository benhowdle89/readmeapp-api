const OAuth = require('oauth').OAuth

const {
  PORT = 3000,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_CALLBACK_URL
} = process.env

const API_BASE = 'https://api.twitter.com/'

const oauth = new OAuth(
  `${ API_BASE }oauth/request_token`,
  `${ API_BASE }oauth/access_token`,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  "1.0A",
  TWITTER_CALLBACK_URL,
  "HMAC-SHA1"
)

module.exports = class Twitter {
  getOAuthRequestToken () {
    return new Promise((resolve, reject) => {
      oauth.getOAuthRequestToken((error, oAuthToken, oAuthTokenSecret) => {
        if (error) return reject({ errors: error })
        return resolve({
          data: {
            oAuthToken,
            oAuthTokenSecret
          }
        })
      })
    })
  }
  getOAuthAccessToken (token, tokenSecret, verifier) {
    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(
        token,
        tokenSecret,
        verifier,
        (error, oAuthAccessToken, oAuthAccessTokenSecret) => {
          if (error) return reject({ errors: error })
          this.getUserData(oAuthAccessToken, oAuthAccessTokenSecret).then(result => {
            const { data: user, errors } = result
            return resolve({
              data: {
                oAuthAccessToken,
                oAuthAccessTokenSecret,
                user
              }
            })
          }).catch(error => console.error(error))
        }
      )
    })
  }
  getUserData (accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
      oauth.get(
        `${ API_BASE }1.1/account/verify_credentials.json`,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error })
          return resolve({
            data: JSON.parse(data)
          })
        }
      )
    })
  }
  async fetchTweets (accessToken, accessTokenSecret, userId, latestId) {
    let timelineUrl = `${ API_BASE }1.1/statuses/home_timeline.json?count=100`
    if (latestId) timelineUrl = `${ timelineUrl }&since_id=${ latestId }`
    return new Promise((resolve, reject) => {
      oauth.get(
        timelineUrl,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error })
          this.getMuted(accessToken, accessTokenSecret).then(({ data: muted }) => {
            const tweets = this.filterSelf(
              this.filterQuotes(
                  this.filterRTs(
                      this.filterMuted(JSON.parse(data), muted)
                  )
              ),
              userId
            )
            return resolve({
              data: tweets
            })
          })
        }
      )
    })
  }
  async getMuted (accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
      oauth.get(
        `${ API_BASE }1.1/mutes/users/ids.json`,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error })
          return resolve({
            data: JSON.parse(data)
          })
        }
      )
    })
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
