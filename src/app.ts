import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())


import errorHandler from './common/middlewares/errorHandlerMiddleware'
import notFound from './common/middlewares/notFoundMiddleware'

app.use(notFound)
app.use(errorHandler)

export default app