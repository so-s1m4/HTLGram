import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketAck, SocketData } from "./types";

export function socketErrorWrapperWithData (func: (data: unknown, userId: Types.ObjectId, io: Server) => any,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >){
        return async function (data: unknown, callback?: SocketAck) {
            try {
                const result = await func(data, socket.data.user.userId, io)
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