const OAuth = require("oauth").OAuth;

const {
  PORT = 3000,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET
} = process.env;

const API_BASE = "https://api.twitter.com/";

module.exports = class Twitter {
  constructor(cb) {
    this.oauth = new OAuth(
      `${API_BASE}oauth/request_token`,
      `${API_BASE}oauth/access_token`,
      TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET,
      "1.0A",
      cb,
      "HMAC-SHA1"
    );
  }
  getOAuthRequestToken() {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthRequestToken((error, oAuthToken, oAuthTokenSecret) => {
        return resolve({
          data: {
            oAuthToken,
            oAuthTokenSecret
          }
        });
      });
    });
  }
  getOAuthAccessToken(token, tokenSecret, verifier) {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        token,
        tokenSecret,
        verifier,
        (error, oAuthAccessToken, oAuthAccessTokenSecret) => {
          if (error) return reject({ errors: error });
          this.getUserData(oAuthAccessToken, oAuthAccessTokenSecret)
            .then(result => {
              const { data: user, errors } = result;
              return resolve({
                data: {
                  oAuthAccessToken,
                  oAuthAccessTokenSecret,
                  user
                }
              });
            })
            .catch(error => console.error(error));
        }
      );
    });
  }
  getUserData(accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
      this.oauth.get(
        `${API_BASE}1.1/account/verify_credentials.json`,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error });
          const user = JSON.parse(data);
          return resolve({
            data: {
              id: user.id,
              name: user.name,
              screen_name: user.screen_name,
              profile_image: user.profile_image_url_https
            }
          });
        }
      );
    });
  }
  getMuted(accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
      this.oauth.get(
        `${API_BASE}1.1/mutes/users/ids.json`,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error });
          return resolve({
            data: JSON.parse(data)
          });
        }
      );
    });
  }
  fetchLists(accessToken, accessTokenSecret, userId) {
    let timelineUrl = `${API_BASE}1.1/lists/list.json`;
    return new Promise((resolve, reject) => {
      this.oauth.get(
        timelineUrl,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error });
          return resolve({
            data: {
              lists: data
            }
          });
        }
      );
    });
  }
  fetchTweets(accessToken, accessTokenSecret, userId, latestId, currentListId) {
    let timelineUrl = `${API_BASE}1.1/statuses/home_timeline.json?count=100&tweet_mode=extended`;
    if (currentListId)
      timelineUrl = `${API_BASE}1.1/lists/statuses.json?count=100&include_rts=false&list_id=${currentListId}`;
    if (latestId) timelineUrl = `${timelineUrl}&since_id=${latestId}`;
    return new Promise((resolve, reject) => {
      this.oauth.get(
        timelineUrl,
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) return reject({ errors: error });
          this.getMuted(accessToken, accessTokenSecret)
            .then(({ data: muted }) => {
              const tweets = this.filterSelf(
                this.filterQuotes(
                  this.filterRTs(
                    this.filterReplies(
                      this.filterMuted(JSON.parse(data), muted)
                    )
                  )
                ),
                userId
              );
              return resolve({
                data: this.tweetPresenter(tweets)
              });
            })
            .catch(error => reject({ errors: error }));
        }
      );
    });
  }
  filterMuted(tweets, { ids }) {
    return tweets.filter(tweet => {
      const {
        user: { id }
      } = tweet;
      return !ids.includes(id);
    });
  }
  filterRTs(tweets) {
    return tweets.filter(tweet => !tweet.retweeted_status);
  }
  filterQuotes(tweets) {
    return tweets.filter(tweet => !tweet.is_quote_status);
  }
  filterSelf(tweets, userId) {
    return tweets.filter(tweet => tweet.user.id !== userId);
  }
  filterReplies(tweets) {
    return tweets.filter(tweet => {
      if (!tweet.in_reply_to_user_id_str) return true;
      if (tweet.user.id_str === tweet.in_reply_to_user_id_str) return true;
      return false;
    });
  }
  tweetPresenter(tweets) {
    return tweets.map(tweet => {
      return {
        id: tweet.id,
        id_str: tweet.id_str,
        entities: tweet.entities,
        extended_entities: tweet.extended_entities,
        created_at: tweet.created_at,
        text: tweet.full_text || tweet.text,
        user: tweet.user,
        in_reply_to_user_id_str: tweet.in_reply_to_user_id_str
      };
    });
  }
};
