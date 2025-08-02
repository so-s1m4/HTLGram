import { Socket, Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapperWithData } from "../../socket/wrappers";
import emojisController from "./emojis.controller";


export const emojisHandler = (
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
    socket.on("emojis:getList", socketErrorWrapperWithData(emojisController.getList, socket, io))
}


