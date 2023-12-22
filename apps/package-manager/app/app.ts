import express, { Express } from 'express'
import root from './router/root'
import user from './router/user'

const app: Express = express()

app.use('', root)
app.use('/users', user)

export default app
