import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'

const app = express()

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 1 minutes"
})

export const publicDir = path.join(__dirname, '../public');

app.use(limiter)
app.use(cors())
app.use(express.json())
app.use('/public', express.static(publicDir))

import userRouter from './modules/users/users.routes'

app.use('/api/users', (req, res, next) => {
    console.log(req.url)
    next()
}, userRouter)

import errorHandler from './common/middlewares/errorHandlerMiddleware'
import notFound from './common/middlewares/notFoundMiddleware'

app.use(notFound)
app.use(errorHandler)

export default app