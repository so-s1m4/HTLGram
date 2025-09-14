import Joi, { any } from 'joi'

export type giftGetListDto = {
	limit: number
	offset: number
}
export type giftSendDto = {
	uid: string
	userId: string
	text: string
	anonymous?: boolean
}
export type giftSellDto = {
	id: string
}
export type giftCreateDto = {
	name: string
	url: string
	value: number
	amount: number
}
export type giftDeleteDto = {
	uid: string
}

export const giftGetListSchema = Joi.object<giftGetListDto>({
	limit: Joi.number().integer().min(1).default(8),
	offset: Joi.number().integer().min(0).default(0),
})
export const giftSendSchema = Joi.object<giftSendDto>({
	uid: Joi.string().required(),
	userId: Joi.string().required(),
	text: Joi.string().min(0).max(500).optional(),
	anonymous: Joi.boolean().optional(),
})
export const giftSellSchema = Joi.object<giftSellDto>({
	id: Joi.string().required(),
})
export const giftCreateSchema = Joi.object<giftCreateDto>({
	name: Joi.string().min(3).required(),
	url: Joi.string().required(),
	value: Joi.number().integer().required(),
	amount: Joi.number().integer().required(),
})
export const giftDeleteSchema = Joi.object<giftDeleteDto>({
	uid: Joi.number().integer().required(),
})
