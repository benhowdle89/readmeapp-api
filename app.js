const http = require('http')
const OAuth = require('oauth').OAuth

if (!process.env.PRODUCTION) {
  require('dotenv').config()
}

const {
  PORT = 3000,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_CALLBACK_URL
} = process.env

http.createServer((req, res) => {
  const oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    "1.0A",
    TWITTER_CALLBACK_URL,
    "HMAC-SHA1"
  )

  oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret) => {
    
  })
  
  res.end('Hello World from Node 8\n')
}).listen(PORT)

console.log('listening on', PORT)
