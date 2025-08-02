import { Server, Socket } from 'socket.io';
import { BaseSpaceI } from "../modules/spaces/spaces.types";
import { userSockets } from "../socket";
import { friendModel } from '../modules/friends/friends.model';

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


export async function emitToAllFriendsIfOnline(userId: string, event: string, data: any, io: Server) {
    const friends = await friendModel.find({
        $or: [
            { user1_id: userId },
            { user2_id: userId }
        ]
    }).lean();
    for (const friend of friends) {
        if (friend.user1_id.toString() === userId.toString()) {
            emitToUserIfOnline(friend.user2_id.toString(), event, data, io);
        } else {
            emitToUserIfOnline(friend.user1_id.toString(), event, data, io);
        }
    }
}
