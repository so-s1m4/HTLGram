import { Types } from "mongoose";

export interface ServerToClientEvents {
  "communication:newMessage": (data: any) => void,
  "communication:editMessage": (data: any) => void,
  "space:addedToNew": (data: any) => void,
}

export type SocketAck = (status: boolean, error?: string, data?: any) => void;

export interface ClientToServerEvents {
    "spaces:getList": (callback?: SocketAck) => any,
    "spaces:delete": (data: any, callback?: SocketAck) => any,
    "spaces:getInfo": (data: any, callback?: SocketAck) => any,
    "spaces:chats:create": (data: any, callback?: SocketAck) => any,

    "communication:chats:create": (data: any, callback?: SocketAck) => any,
    "communication:chats:getList": (data: any, callback?: SocketAck) => any,
    "communication:chats:close": (data: any, callback?: SocketAck) => any,
    "communication:chats:update": (data: any, callback?: SocketAck) => any,
    "communication:chat:deleteMedias": (data: any, callback?: SocketAck) => any,
    "communication:chat:deleteMessage": (data: any, callback?: SocketAck) => any,
}

export interface InterServerEvents {

}

export interface SocketData {
  user: {userId: Types.ObjectId}
}