import { model, Schema, Types } from 'mongoose'
import { GiftUserI, GiftI } from './gifts.types'

const GiftSchema = new Schema<GiftI>({
	name: { type: String, required: true },
	url: { type: String, required: true, unique: true },
	value: {
		type: Number,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
})

const GiftUserSchema = new Schema<GiftUserI>(
	{
		giftId: {
			type: Types.ObjectId,
			ref: 'Gift',
			required: true,
		},
		userId: {
			type: Types.ObjectId,
			ref: 'User',
			required: true,
		},
		senderId: {
			type: Types.ObjectId,
			ref: 'User',
			required: true,
		},
		isAnonym: {
			type: Boolean,
			default: false,
		},
		text: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
)

export const GiftModel = model<GiftI>('Gift', GiftSchema)
export const GiftUserModel = model<GiftUserI>('GiftUser', GiftUserSchema)
