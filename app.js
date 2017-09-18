const http = require('http')

if (!process.env.PRODUCTION) {
  require('dotenv').config()
}

const Router = require('./lib/router')
const response = require('./lib/response')

const {
  PORT = 3000
} = process.env

http.createServer(async (req, res) => {

  const router = new Router()
  const { data, errors } = await router.handle(req)
  return res.end(response({
    data,
    errors
  }))

}).listen(PORT)

console.log('listening on', PORT)
