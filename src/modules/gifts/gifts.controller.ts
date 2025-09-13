import { validationWrapper } from '../../common/utils/utils.wrappers'
import { Types } from 'mongoose'
import { giftGetListDto, giftGetListSchema } from './gifts.dto'
import { Server } from 'socket.io'
import giftsService from './gifts.service'

const giftsController = {
	async getList(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
	},
	async send(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
	},
	async sell(data: any, userId: Types.ObjectId, io: Server) {
		const dto = validationWrapper<giftGetListDto>(giftGetListSchema, data)
		const gifts = await giftsService.getList(dto)
		return gifts
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
