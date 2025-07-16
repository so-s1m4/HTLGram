import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from "../../server";
import { Socket, Server } from "socket.io";
import spacesController from './spaces.controller';
import { socketErrorWrapper } from "../../common/utils/utils.wrappers";

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
    socket.on("spaces:create", socketErrorWrapper(spacesController.createSpace, socket))
}


