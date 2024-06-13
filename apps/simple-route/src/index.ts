import { type Socket, createServer } from 'node:net'

class Request {
  constructor(
    private readonly methodRequest: string,
    private readonly pathRequest: string,
    private readonly headersRequest: Map<string, string>,
    private readonly bodyRequest: string
  ) {}

  method() {
    return this.methodRequest
  }

  path() {
    return this.pathRequest
  }

  headers() {
    console.log(this.headersRequest)
    return this.headersRequest
  }

  body() {
    return this.bodyRequest
  }
}

class Response {
  constructor(private readonly socket: Socket) {}

  json(data: any) {
    this.socket.write(
      Buffer.from(
        `HTTP/1.1 200\r\nContent-Type: application/json\r\nContent-Length: ${JSON.stringify(data).length}\r\n\r\n${JSON.stringify(data)}`
      )
    )
    this.socket.end()
  }
}

export default function () {
  const route = {
    GET: {},
    POST: {}
  }
  return {
    add: function (method: 'GET' | 'POST', path: string, handler: (req: Request, res: Response) => void) {
      route[method] = {
        [path]: handler
      }
    },
    run: function () {
      const server = createServer((socket) => {
        socket.on('data', (data) => {
          const [rest, body] = data.toString().split('\r\n\r\n')
          const [req, ...headers] = rest.toString().split('\r\n')
          const map = new Map<string, string>()
          headers
            .filter((header) => header !== '')
            .forEach((header) => {
              const [key, value] = header.split(':')
              map.set(key.trim(), value.trim())
            })
          const [method, path] = req.split(' ')

          const request = new Request(method, path, map, body)
          const response = new Response(socket)

          // @ts-ignore
          const handler = route[method][path]
          if (handler) {
            handler(request, response)
          } else {
            socket.write(Buffer.from(`HTTP/1.1 404\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n`))
            socket.end()
          }
        })
      })
      server.listen(4221, '127.0.0.1', () => {
        console.log('Server is running on http://127.0.0.1:4221')
      })
    }
  }
}
