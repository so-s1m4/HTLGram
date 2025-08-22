import { Socket, Server } from "socket.io";
import spacesController from './spaces.controller';
import chatsController from "./chats/chats.controller";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapper, socketErrorWrapperWithData } from "../../socket/wrappers";
import groupController from "./groups/groups.controller";

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
    socket.on("spaces:getList", socketErrorWrapper(spacesController.getSpacesList, socket))
    socket.on("spaces:delete", socketErrorWrapperWithData(spacesController.deleteSpace, socket, io)),
    socket.on("spaces:getInfo", socketErrorWrapperWithData(spacesController.getInfo, socket, io)),
    socket.on("spaces:readMessages", socketErrorWrapperWithData(spacesController.readMessages, socket, io)),
    socket.on("spaces:getMembers", socketErrorWrapperWithData(spacesController.getMembers, socket, io)),
    socket.on("spaces:addAdmin", socketErrorWrapperWithData(spacesController.addAdmin, socket, io)),
    socket.on("spaces:removeAdmin", socketErrorWrapperWithData(spacesController.removeAdmin, socket, io)),
    socket.on("spaces:leave", socketErrorWrapperWithData(spacesController.leave, socket, io)),

    socket.on("spaces:chats:create", socketErrorWrapperWithData(chatsController.createChat, socket, io)),

    socket.on("spaces:group:create", socketErrorWrapperWithData(groupController.createGroup, socket, io)),
    socket.on("spaces:group:addMembers", socketErrorWrapperWithData(groupController.addMembers, socket, io))
    socket.on("spaces:group:removeMembers", socketErrorWrapperWithData(groupController.removeMembers, socket, io))
}


