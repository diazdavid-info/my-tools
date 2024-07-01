import { HTTPParser } from 'http-parser-js'

export const parseHttpRequest = ({ data, host, port }: { data: Buffer; host: string; port: number }): Request => {
  const parser = new HTTPParser(HTTPParser.REQUEST)
  const request = {
    method: '',
    pathname: '',
    headers: {},
    body: ''
  }

  parser[HTTPParser.kOnHeadersComplete] = (info) => {
    const headers: Record<string, string> = {}
    for (let i = 0; i < info.headers.length; i += 2) {
      const key = info.headers.at(i) as string
      headers[key] = info.headers.at(i + 1) as string
    }
    request.method = HTTPParser.methods[info.method]
    request.pathname = info.url
    request.headers = headers
  }

  parser[HTTPParser.kOnBody] = (body, start, len) => {
    request.body += body.subarray(start, start + len).toString()
  }

  parser.execute(data)

  const { method, pathname, headers, body } = request
  const url = new URL(`http://${host}:${port}${pathname}`)

  return ['GET', 'HEAD'].includes(method)
    ? new Request(url, { headers, method })
    : new Request(url, { body, headers, method })
}
