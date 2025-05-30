import {Request, Response, NextFunction} from 'express'

interface ErrorWithStatus extends Error {
    status?: number
}

const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.log(err)

    const status = err.status || 500
    const message = err.message || "Internal server error"
    res.status(status).json({message});
}

export default errorHandler