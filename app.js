const http = require('http')
const oauth = require('oauth')

const { PORT = 3000 } = process.env

http.createServer((req, res) => {
  res.end('Hello World from Node 8\n')
}).listen(PORT)

console.log('listening on', PORT)
