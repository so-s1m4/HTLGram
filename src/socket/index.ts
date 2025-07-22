import { Server, Socket } from 'socket.io';
import { spacesHandler } from "../modules/spaces/spaces.socket";
import spacesService from "../modules/spaces/spaces.service";
import { Server as HttpServer } from 'http';
import JWTMiddlewareSocket from './middlewareSocket';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types';
import { BaseSpaceI } from '../modules/spaces/spaces.types';

const userSockets = new Map<string, Set<string>>();

function handleConnection(userId: string, socketId: string) {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set<string>())
    }
    userSockets.get(userId)?.add(socketId)
}

function handleDisconnection(userId: string, socketId: string) {
    const set = userSockets.get(userId)
    if (!set) return

    set.delete(socketId)

    if (set.size === 0) {
        userSockets.delete(userId)
    }
}

export function isUserOnline(userId: string): Set<string> | undefined {
  return userSockets.get(userId);
}

async function connectToRooms(socket: Socket) {
  try {
    const spaces = await spacesService.getSpacesList(socket.data.user.userId);
    for (const space of spaces) {
      socket.join(`${space.space_id.type}:${space.space_id._id}`);
    }
  } catch (e) {
    console.error("Failed to join rooms", e);
  }
}

export function addSocketToNewSpaceIfOnline(space: BaseSpaceI, userId: string, io: Server) {
    const sockets = isUserOnline(userId)
    if (!sockets) return
    for (const socket_id of sockets) {
        const socket = io.sockets.sockets.get(socket_id)
        if (!socket) continue
        socket.join(`${space.type}:${space._id}`)

        socket.emit("space:addedToNew", space)
    }
    
}


function initSocket(httpServer: HttpServer) {
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
        >(httpServer, {
        cors: { origin: '*' },
    });

    io.use(JWTMiddlewareSocket)
    
    io.on("connection", async (socket) => {
        handleConnection(socket.data.user.userId.toString(), socket.id)

        spacesHandler(io, socket)
        
        await connectToRooms(socket)
        socket.on("disconnect", () => {
            handleDisconnection(socket.data.user.userId.toString(), socket.id)
        })
    })

    console.log("Socket.IO initialized")
    return io
}

export default initSocket

