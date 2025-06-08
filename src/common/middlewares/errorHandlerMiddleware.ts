import {Request, Response, NextFunction} from 'express'
import path from 'path'
import fs from 'fs'

export class ErrorWithStatus extends Error {
    status?: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)

    // chat gpt
    const deleteFile = (filename: string) => {
        const filePath = path.join(__dirname, '../../../public', filename)
        fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) {
                console.error('File couldnt be deleted', unlinkErr)
            }
        })
    }

    // chat gpt
    if (req.file) {
        deleteFile(req.file.filename)
    }

    // chat gpt
    if (req.files) {
        const filesArray: Express.Multer.File[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat() as Express.Multer.File[]
        filesArray.forEach(file => deleteFile(file.filename))
    }

    if (err instanceof ErrorWithStatus) {
        const status = err.status || 500
        const message = err.message || "Internal server error"
        res.status(status).json({message});
    } else {
        res.status(500).json({message:"Internal server error"});
    }
}

export default errorHandler