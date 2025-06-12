import express from 'express'

const router = express.Router()

router.post('/')
router.patch('/:requestId')
router.get('/')
router.delete('/:requestId')

export default router