import { Server, Socket } from 'socket.io';
import { BaseSpaceI } from "modules/spaces/spaces.types";
import { userSockets } from "socket";

export function isUserOnline(userId: string): Set<string> | undefined {
  return userSockets.get(userId);
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

export function emitToUserIfOnline(userId: string, event: string, data: any, io: Server) {
    const sockets = isUserOnline(userId)
    if (!sockets) return
    for (const socket_id of sockets) {
        const socket = io.sockets.sockets.get(socket_id)
        if (!socket) continue
        socket.emit(event, data)
    }
}

