const http = require('http')
const jsonBody = require("body/json")

if (!process.env.PRODUCTION) {
  require('dotenv').config()
}

const Router = require('./lib/router')
const CORS = require('./lib/cors')
const response = require('./lib/response')

const {
  PORT = 3000
} = process.env

http.createServer(async (req, res) => {
  jsonBody(req, res, async (err, body) => {
    
    CORS(res)
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
  
    const router = new Router()

    const {
      data = {},
      errors = {}
    } = await router.handle(req, body)

    const responseErrors = errors.errors || errors

    if (responseErrors && Object.keys(responseErrors).length) {
      res.statusCode = responseErrors.statusCode || 400
    }

    return res.end(response({
      data,
      errors: responseErrors
    }))

  })
}).listen(PORT)

console.log('listening on', PORT)
