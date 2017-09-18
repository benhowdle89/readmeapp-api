const http = require('http')

if (!process.env.PRODUCTION) {
  require('dotenv').config()
}

const Twitter = require('./lib/twitter')
const response = require('./lib/response')

const {
  PORT = 3000
} = process.env

http.createServer(async (req, res) => {
  
  const twitter = new Twitter()
  const { data, errors } = await twitter.getOAuthRequestToken()
  return res.end(response({
    data,
    errors
  }))

}).listen(PORT)

console.log('listening on', PORT)
