import { Schema } from 'mongoose'

export interface GiftI {
	_id: Schema.Types.ObjectId
	name: string
	url: string
	value: number
	amount: number
}

export interface GiftUserI {
	_id: Schema.Types.ObjectId
	giftId: Schema.Types.ObjectId
	userId: Schema.Types.ObjectId
	senderId: Schema.Types.ObjectId
	text: string
	isAnonym: boolean
	createdAt: Date
	updatedAt: Date
}
