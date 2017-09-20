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

    if (errors && Object.keys(errors).length) res.statusCode = 400

    return res.end(response({
      data,
      errors
    }))

  })
}).listen(PORT)

console.log('listening on', PORT)
