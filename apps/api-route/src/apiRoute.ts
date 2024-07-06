import { createServer } from 'node:net'
import { processor } from './processor'
import Route from './route'

export type Method = 'GET' | 'POST'

export type Handler = ({ request }: { request: Request }) => Response
type ApiRoute = {
  add: (method: Method, path: string, handler: Handler) => void
  run: (port: number, callback: () => void) => void
}

export const apiRouter = (): ApiRoute => {
  const route = new Route()
  const host = 'localhost'

  return {
    add: function (method, path, handler) {
      route.add(method, path, handler)
    },
    run: function (port, callback) {
      createServer((socket) =>
        socket.on('data', (data) =>
          processor({ data, route, host, port }).then((buffer) => {
            socket.write(buffer)
            // socket.end()
          })
        )
      ).listen(port, host, () => callback())
    }
  }
}
