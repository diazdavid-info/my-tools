import { createServer } from 'node:http'
import app from './app'

const port = 6001

const server = createServer(app)

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
