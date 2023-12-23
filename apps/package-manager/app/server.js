import { createServer } from 'node:http'
import app from './app'
import { PORT } from './config.cjs'

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
