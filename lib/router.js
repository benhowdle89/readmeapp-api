const url = require('url')
const querystring = require('querystring')

const Twitter = require('./twitter')

const handler = type => {
  return {
    oauth_request: async () => {
      const twitter = new Twitter()
      return await twitter.getOAuthRequestToken()
    },
    auth_token: async ({ body: { token, tokenSecret, verifier } }) => {
      const twitter = new Twitter()
      return await twitter.getOAuthRequestToken(token, tokenSecret, verifier)
    },
    user_data: async ({ body: { token, tokenSecret } }) => {
      const twitter = new Twitter()
      return await twitter.getUserData(token, tokenSecret)
    }
  }[type]
}

module.exports = class Router {
  async handle (req) {
    const { query } = url.parse(req.url)
    const params = querystring.parse(query)
    const { type } = params
    const method = handler(type)
    if (!method) {
      return {
        errors: {
          status: 404
        }
      }
    }
    return await method(req)
  }
}
