import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from "../../server";
import { Socket, Server } from "socket.io";
import spacesController from './spaces.controller';
import { socketErrorWrapper, socketErrorWrapperWithData } from "../../common/utils/utils.wrappers";

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
    socket.on("spaces:create", socketErrorWrapperWithData(spacesController.createSpace, socket)),
    socket.on("spaces:getList", socketErrorWrapper(spacesController.getSpacesList, socket)),
    socket.on("spaces:update", socketErrorWrapperWithData(spacesController.updateSpace, socket)),
    socket.on("spaces:delete", socketErrorWrapperWithData(spacesController.deleteSpace, socket))
}


