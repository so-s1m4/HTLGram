import { ExtendedError, Socket } from "socket.io";
import { ErrorWithStatus } from './errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { config } from '../../config/config'
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from 'server';
import { Types } from "mongoose";

const JWTMiddlewareSocket = (socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,  next: (err?: ExtendedError) => void) => {
        try {
            const token = socket.handshake.auth.token
            if (!token) throw new ErrorWithStatus(401, "No authorization header find")
            const data = jwt.verify(token, config.JWT_SECRET) as {userId: Types.ObjectId}
            socket.data.user = data
            next()
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error("Unexpected error");
            next(new ErrorWithStatus(401, err.message));
        }
    }

export default JWTMiddlewareSocket