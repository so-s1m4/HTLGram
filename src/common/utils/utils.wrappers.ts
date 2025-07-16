import { ErrorWithStatus } from '../middlewares/errorHandlerMiddleware';
import {ObjectSchema} from 'joi'
import {Request, Response, NextFunction} from 'express'
import { Types } from 'mongoose';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, SocketAck } from 'server';
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



export function socketErrorWrapperWithData (func: (data: unknown, userId: Types.ObjectId) => any,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >){
        return async function (data: unknown, callback?: SocketAck) {
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

export function socketErrorWrapper (func: (userId: Types.ObjectId) => any,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >){
        return async function (callback?: SocketAck) {
            try {
                const result = await func(socket.data.user.userId)
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