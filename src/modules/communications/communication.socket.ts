import { Socket, Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapperWithData } from "../../socket/wrappers";
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
    socket.on("communication:create", socketErrorWrapperWithData(communicationController.create, socket, io)),
    socket.on("communication:update", socketErrorWrapperWithData(communicationController.update, socket, io)),
    socket.on("communication:deleteMedias", socketErrorWrapperWithData(communicationController.deleteMedias, socket, io))
    socket.on("communication:deleteMessages", socketErrorWrapperWithData(communicationController.deleteMessages, socket, io))
}


