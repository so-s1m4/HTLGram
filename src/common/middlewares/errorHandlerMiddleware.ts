import {Request, Response, NextFunction} from 'express'

export class ErrorWithStatus extends Error {
    status?: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    if (err instanceof ErrorWithStatus) {
        const status = err.status || 500
        const message = err.message || "Internal server error"
        res.status(status).json({message});
    } else {
        res.status(500).json({message:"Internal server error"});
    }
}

export default errorHandler