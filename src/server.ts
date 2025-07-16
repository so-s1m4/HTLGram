import app from './app'
import connectDB from './config/db'
import {config} from './config/config'
import http from 'http'
import {Server} from 'socket.io'
import { spacesHandler } from './modules/spaces/spaces.socket'
import JWTMiddlewareSocket from './common/middlewares/JWTMiddlewareSocket'
import { Types } from 'mongoose'


export interface ServerToClientEvents {

}

export type SocketAck = (status: boolean, error?: string, data?: any) => void;

export interface ClientToServerEvents {
    "spaces:create": (data: any, callback?: SocketAck) => any,
    "spaces:getList": (callback?: SocketAck) => any
}

export interface InterServerEvents {

}

export interface SocketData {
  user: {userId: Types.ObjectId}
}

const startServer = async () => {
    try {
        await connectDB()

        const httpServer = http.createServer(app);

        const io = new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
            >(httpServer, {
            cors: { origin: '*' },
        });

        io.use(JWTMiddlewareSocket)

        io.on("connection", (socket) => {
            spacesHandler(io, socket)
        })

        httpServer.listen(config.PORT, () => {
            console.log(`Server runs on http://localhost:${config.PORT}`)
        })
    } catch (error: any) {
        console.log(error.message)
        process.exit(1)
    }
}

startServer()