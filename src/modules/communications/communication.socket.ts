import { Socket, Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapper, socketErrorWrapperWithData } from "../../socket/wrappers";
import communicationController from "./communication.controller";

export const communicationHandler = (
    io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >, 
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
) => {
    socket.on("communication:chats:create", socketErrorWrapperWithData(communicationController.create, socket, io)),
    socket.on("communication:chats:getList", socketErrorWrapperWithData(communicationController.getList, socket, io)),
    socket.on("communication:chats:close", socketErrorWrapperWithData(communicationController.close, socket, io)),
    socket.on("communication:chats:update", socketErrorWrapperWithData(communicationController.update, socket, io)),
    socket.on("communication:chat:deleteMedias", socketErrorWrapperWithData(communicationController.deleteMedia, socket, io))
    // socket.on("communication:chat:deleteMessage", socketErrorWrapperWithData(communicationController.deleteMessage, socket, io))
}


