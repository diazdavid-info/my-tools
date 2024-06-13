import simpleRoute from '../src'

const app = simpleRoute()

app.add('GET', '/', (req, res) => {
  res.json({ req, headers: req.headers(), body: req.body() })
})

app.run()
