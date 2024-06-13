import { createServer } from 'node:http'
import url from 'node:url'
import { AddressInfo } from 'node:net'

const run = async () => {
  const server = createServer((req, res) => {
    if (req.url?.match(/\/.*/)) {
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
            res.writeHead(201, {
              'Content-type': 'application/json; charset=utf-8'
            })
            res.end(JSON.stringify(data))
          })
          break
        }
      }
    }
  })

  server.listen(6001, () => {
    const address = server.address() as AddressInfo
    const port = address ? address.port : 0

    console.log(`Server corriendo en  http://localhost:${port}`)
  })

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      reject(`Error en el servidor ${err}`)
    })
    server.on('close', () => {
      resolve('Server cerrado')
    })
  })
}

export default run
