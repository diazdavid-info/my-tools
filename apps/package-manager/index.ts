import express from 'express'

const port = 6001
const app = express()

app.get('/', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Example app listening on  http://localhost:${port}`)
})
