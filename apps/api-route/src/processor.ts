import { parseHttpRequest } from './parser'
import { Method } from './apiRoute'
import { match } from 'path-to-regexp'
import Route from './route'

type ProcessorRequest = {
  data: Buffer
  host: string
  port: number
  route: Route
}

const searchPathname = (pathname: string, method: Method, route: Route) => {
  const pathList = route.getByMethod(method)

  for (const key of Object.keys(pathList)) {
    const urlMatch = match<Record<string, string>>(key, {
      decode: decodeURIComponent
    })
    const matched = urlMatch(pathname)
    if (matched) {
      const { params } = matched
      return { pathnameRoute: key, pathname, params }
    }
  }

  return { pathnameRoute: '', pathname, params: {} }
}

export const processor = async ({ data, route, host, port }: ProcessorRequest) => {
  const request = parseHttpRequest({ data, host, port })
  const method = request.method as Method
  const url = new URL(request.url)

  const { pathnameRoute, params } = searchPathname(url.pathname, method, route)

  const handler = route.getHandler(method, pathnameRoute)

  if (!handler) return Buffer.from(`HTTP/1.1 404\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n`)

  const res = await handler({ request, params })
  const { status, headers } = res

  let headersString = ''
  for (const [key, value] of headers.entries()) {
    headersString += `${key}: ${value}\r\n`
  }

  const body = await res.text()

  return Buffer.from(`HTTP/1.1 ${status}\r\n${headersString}Content-Length: ${body.length}\r\n\r\n${body}`)
}
