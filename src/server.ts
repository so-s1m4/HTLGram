import app from './app'
import connectDB from './config/db'
import {config} from './config/config'
import http from 'http'
import {Server} from 'socket.io'
import { spacesHandler } from 'modules/spaces/spaces.socket'



const startServer = async () => {
    try {
        await connectDB()

        const httpServer = http.createServer(app);
        const io = new Server(httpServer, {
            cors: { origin: '*' },
        });

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