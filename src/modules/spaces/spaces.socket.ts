import { Socket, Server } from "socket.io";
import spacesController from './spaces.controller';
import chatsController from "./chats/chats.controller";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapper, socketErrorWrapperWithData } from "../../socket/wrappers";

export const spacesHandler = (
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
    socket.on("spaces:getList", socketErrorWrapper(spacesController.getSpacesList, socket)),
    // socket.on("spaces:delete", socketErrorWrapperWithData(spacesController.deleteSpace, socket, io)),
    socket.on("spaces:getInfo", socketErrorWrapperWithData(spacesController.getInfo, socket, io))

    socket.on("spaces:chats:create", socketErrorWrapperWithData(chatsController.createChat, socket, io))
}


