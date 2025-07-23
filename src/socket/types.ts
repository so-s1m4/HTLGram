import { Types } from "mongoose";

export interface ServerToClientEvents {

}

export type SocketAck = (status: boolean, error?: string, data?: any) => void;

export interface ClientToServerEvents {
    "spaces:getList": (callback?: SocketAck) => any,
    "spaces:delete": (data: any, callback?: SocketAck) => any,
    "spaces:chats:create": (data: any, callback?: SocketAck) => any
}

export interface InterServerEvents {

}

export interface SocketData {
  user: {userId: Types.ObjectId}
}