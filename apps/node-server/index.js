import { createServer } from 'node:http'

const server = createServer((req, res) => {
  if (req.url === '/') {
    switch (req.method) {
      case 'GET': {
        res.statusCode = 200
        res.setHeader('Content-type', 'text/plain; charset=utf-8')
        res.end('<h1>Hola, qué tal?? 😊</h1>')
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

server.listen(5000, () => {
  console.log(`Server corriendo en  http://localhost:${server.address().port}`)
})
