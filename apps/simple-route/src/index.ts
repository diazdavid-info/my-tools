import net from 'node:net'

const server = net.createServer((socket) => {
  socket.end()
})

server.listen(4221, '127.0.0.1', () => {
  console.log('Server is running on http://127.0.0.1:4221')
})
