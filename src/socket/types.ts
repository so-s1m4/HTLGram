import { Types } from "mongoose";

export interface ServerToClientEvents {
  "communication:newMessage": (data: any) => void,
  "communication:editMessage": (data: any) => void,
  "space:addedToNew": (data: any) => void,
  "space:readMessages": (data: any) => void,
  "space:deleted": (data: any) => void,
  "communication:deleteMedia": (data: any) => void,
  "communication:deleteMessage": (data: any) => void,
  "friends:newRequest": (data: any) => void,
  "friends:requestCanceled": (data: any) => void,
  "friends:requestAccepted": (data: any) => void,
  "friends:requestDeleted": (data: any) => void,
}

export type SocketAck = (status: boolean, error?: string, data?: any) => void;

export interface ClientToServerEvents {
    "spaces:getList": (callback?: SocketAck) => any,
    "spaces:delete": (data: any, callback?: SocketAck) => any,
    "spaces:getInfo": (data: any, callback?: SocketAck) => any,
    "spaces:chats:create": (data: any, callback?: SocketAck) => any,
    "spaces:readMessages": (data: any, callback?: SocketAck) => any,
    "spaces:group:create": (data: any, callback?: SocketAck) => any,

    "communication:create": (data: any, callback?: SocketAck) => any,
    "communication:getList": (data: any, callback?: SocketAck) => any,
    "communication:close": (data: any, callback?: SocketAck) => any,
    "communication:update": (data: any, callback?: SocketAck) => any,
    "communication:deleteMedias": (data: any, callback?: SocketAck) => any,
    "communication:deleteMessages": (data: any, callback?: SocketAck) => any,

    "friends:createRequest": (data: any, callback?: SocketAck) => any,
    "friends:acceptRequest": (data: any, callback?: SocketAck) => any,
    "friends:cancelRequest": (data: any, callback?: SocketAck) => any,
    "friends:deleteRequest": (data: any, callback?: SocketAck) => any,
    "friends:getRequestsList": (data: any, callback?: SocketAck) => any,

    "emojis:getList": (data: any, callback?: SocketAck) => any,
    "emojis:toggle": (data: any, callback?: SocketAck) => any,
}

export interface InterServerEvents {

}

export interface SocketData {
  user: {userId: Types.ObjectId}
}

export interface spaceForaddSockettoNewSpaceIfOnline {
  type: string;
  id: string
}