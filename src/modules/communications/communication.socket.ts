import { Socket, Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapperWithData } from "../../socket/wrappers";
import chatController from "./chats/chats.controller";
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
    socket.on("communication:getList", socketErrorWrapperWithData(communicationController.getList, socket, io)),
    socket.on("communication:close", socketErrorWrapperWithData(communicationController.close, socket, io)),
    socket.on("communication:chats:create", socketErrorWrapperWithData(chatController.create, socket, io)),
    socket.on("communication:chats:update", socketErrorWrapperWithData(chatController.update, socket, io)),
    socket.on("communication:chats:deleteMedias", socketErrorWrapperWithData(chatController.deleteMedias, socket, io))
    socket.on("communication:chats:deleteMessages", socketErrorWrapperWithData(chatController.deleteMessages, socket, io))
}


