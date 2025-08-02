import { Server, Socket } from 'socket.io';
import { spacesHandler } from "../modules/spaces/spaces.socket";
import spacesService from "../modules/spaces/spaces.service";
import { Server as HttpServer } from 'http';
import JWTMiddlewareSocket from './middlewareSocket';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types';
import { BaseSpaceI } from '../modules/spaces/spaces.types';
import { communicationHandler } from '../modules/communications/communication.socket';
import { friendsHandler } from '../modules/friends/friends.socket';
import { UserModel } from '../modules/users/users.model';
import { emitToAllFriendsIfOnline } from './socket.utils';
import { emojisHandler } from '../modules/emojis/emojis.socket';

export const userSockets = new Map<string, Set<string>>();

async function handleConnection(userId: string, socketId: string, io: Server) {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set<string>())
    }
    userSockets.get(userId)?.add(socketId)
    if (userSockets.get(userId)?.size === 1) {
      await emitToAllFriendsIfOnline(
        userId,
        "friends:friendOnline",
        { userId: userId },
        io
      )
    }
}

async function handleDisconnection(userId: string, socketId: string, io: Server) {
    const set = userSockets.get(userId)
    if (!set) return

    set.delete(socketId)

    if (set.size === 0) {
        userSockets.delete(userId)
        await emitToAllFriendsIfOnline(
          userId,
          "friends:friendOffline",
          { userId: userId, wasOnline: new Date() },
          io
        )
        await UserModel.updateOne(
          { _id: userId },
          { $set: { wasOnline: new Date() } }
        );
    }
}



async function connectToRooms(socket: Socket) {
  try {
    const spaces = await spacesService.getSpacesList(socket.data.user.userId);
    for (const space of spaces) {
      socket.join(`${space.spaceId.type}:${space.spaceId._id}`);
    }
  } catch (e) {
    console.error("Failed to join rooms", e);
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
        await handleConnection(socket.data.user.userId.toString(), socket.id, io)

        spacesHandler(io, socket)
        communicationHandler(io, socket)
        friendsHandler(io, socket)
        emojisHandler(io, socket)
        
        await connectToRooms(socket)
        socket.on("disconnect", async () => {
            await handleDisconnection(socket.data.user.userId.toString(), socket.id, io)
        })
    })

    console.log("Socket.IO initialized")
    return io
}

export default initSocket

