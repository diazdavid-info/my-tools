import { createServer } from 'node:http'
import url from 'node:url'

const server = createServer((req, res) => {
  if (req.url.match(/\/.*/)) {
    switch (req.method) {
      case 'GET': {
        const parsedUrlQuery = url.parse(req.url, true).query
        res.statusCode = 200
        res.setHeader('Content-type', 'text/plain; charset=utf-8')
        res.end(`<h1>Hola, qué tal?? 😊</h1> ${JSON.stringify(parsedUrlQuery)}`)
        break
      }
      case 'POST': {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })
        req.on('end', () => {
          const data = JSON.parse(body)
          res.writeHead(201, { 'Content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify(data))
        })
        break
      }
    }
  }
})

server.listen(6000, () => {
  console.log(`Server corriendo en  http://localhost:${server.address().port}`)
})
