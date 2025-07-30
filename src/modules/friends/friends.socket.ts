import { Socket, Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../socket/types";
import { socketErrorWrapper, socketErrorWrapperWithData } from "../../socket/wrappers";
import spacesController from "../../modules/spaces/spaces.controller";
import friendsController from "./friends.controller";

export const friendsHandler = (
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
    socket.on("friends:createRequest", socketErrorWrapperWithData(friendsController.createFriendRequest, socket, io))
    socket.on("friends:cancelRequest", socketErrorWrapperWithData(friendsController.cancelRequest, socket, io))
    socket.on("friends:acceptRequest", socketErrorWrapperWithData(friendsController.acceptRequest, socket, io))
    socket.on("friends:getRequestsList", socketErrorWrapperWithData(friendsController.getFriendRequests, socket, io))
    socket.on("friends:deleteRequest", socketErrorWrapperWithData(friendsController.deleteFriendRequest, socket, io))
}


