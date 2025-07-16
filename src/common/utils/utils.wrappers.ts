import { ErrorWithStatus } from '../middlewares/errorHandlerMiddleware';
import {ObjectSchema} from 'joi'
import {Request, Response, NextFunction} from 'express'
import { Types } from 'mongoose';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from 'server';
import { Socket } from 'socket.io';

export function validationWrapper(schema: ObjectSchema, data: any) {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new ErrorWithStatus(400, error.message)
    } else {
        return value
    }
}

export function ErrorWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
        await fn(req, res, next)
    } catch (error) {
        next(error)
    }
  };
}



export function socketErrorWrapper (func: (data: any, userId: Types.ObjectId) => any,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >){
        return async function (data: any, callback?: (status: boolean, error?: string, data?:any) => void) {
            try {
                const result = await func(data, socket.data.user.userId)
                if (typeof callback === "function") {
                    callback(true, undefined, result)
                }
            } catch (e) {
                const err = e instanceof Error ? e.message : "Unexpected error";
                if (typeof callback === "function") {
                    callback(false, err, undefined)
                }   
            }
        }
    }