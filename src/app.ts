import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

const app = express()

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 1 minutes"
})

app.use(limiter)
app.use(cors())
app.use(express.json())


import errorHandler from './common/middlewares/errorHandlerMiddleware'
import notFound from './common/middlewares/notFoundMiddleware'

app.use(notFound)
app.use(errorHandler)

export default app