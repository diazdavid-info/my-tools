import { Router } from 'express'

const router: Router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'success' })
})

router.post('/', (req, res) => {
  res.json({ status: 'success' })
})

export default router
