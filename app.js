const http = require('http')

if (!process.env.PRODUCTION) {
  require('dotenv').config()
}

const Router = require('./lib/router')
const response = require('./lib/response')

const {
  PORT = 3000
} = process.env

const setCORSHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
}

http.createServer(async (req, res) => {

  setCORSHeaders(res)

  if (req.method === 'OPTIONS') {
		res.writeHead(200)
		res.end()
		return
	}

  const router = new Router()
  const { data, errors } = await router.handle(req)
  return res.end(response({
    data,
    errors
  }))

}).listen(PORT)

console.log('listening on', PORT)
