import { Socket, Server } from 'socket.io'
import {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from '../../socket/types'
import { socketErrorWrapperWithData } from '../../socket/wrappers'
import giftsController from './gifts.controller'

export const giftsHandler = (
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
	socket.on(
		'gifts:getList',
		socketErrorWrapperWithData(giftsController.getList, socket, io)
	)
	socket.on(
		'gifts:send',
		socketErrorWrapperWithData(giftsController.send, socket, io)
	)
	socket.on(
		'gifts:sell',
		socketErrorWrapperWithData(giftsController.sell, socket, io)
	)
	socket.on(
		'gifts:create',
		socketErrorWrapperWithData(giftsController.create, socket, io)
	)
	socket.on(
		'gifts:delete',
		socketErrorWrapperWithData(giftsController.delete, socket, io)
	)
}
