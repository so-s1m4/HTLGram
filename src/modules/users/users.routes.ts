import express from 'express'
import { postUser } from './users.controller'

const router = express.Router()

router.post('/', postUser)

export default router