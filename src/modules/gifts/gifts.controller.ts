import { validationWrapper } from '../../common/utils/utils.wrappers'
import { Types } from 'mongoose'
import { giftGetListDto, giftGetListSchema, giftSendSchema, giftSendDto, giftSellDto, giftSellSchema } from './gifts.dto'
import { Server } from 'socket.io'
import giftsService from './gifts.service'
import { emitToUserIfOnline } from '../../socket/socket.utils'

const giftsController = {
	async getList(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
	},
	async getOfUser(data: any, userId: Types.ObjectId, io: Server) {
		const gifts = await giftsService.getOfUser(data.userId)
		return gifts
	},
	async send(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftSendDto>(giftSendSchema, data)
		const response = await giftsService.send(dto, userId)
		emitToUserIfOnline(dto.userId, 'gifts:receive', response, io)

		return response
	},
	async sell(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftSellDto>(giftSellSchema, data)
		const response = await giftsService.sell(dto, userId)
		return response
	},
	async create(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
	},
	async delete(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
	},

	// async toggle(data: any, userId: Types.ObjectId, io: Server) {
	// 	const dto = validationWrapper<>(giftToggleSchema, data)
	// 	const giftResponse = await giftsService.toggle(dto, userId)
	// 	io.to(`space:${giftResponse.gift.spaceId}`).emit(
	// 		'gifts:toggle',
	// 		giftResponse
	// 	)
	// 	return giftResponse
	// },
}

export default giftsController
