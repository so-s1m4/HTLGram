import { HydratedDocument, MergeType, PopulatedDoc, Types } from 'mongoose'
import { giftGetListDto, giftSellDto, giftSendDto } from './gifts.dto'
import { GiftUserModel, GiftModel } from './gifts.model'
import { GiftUserI, GiftI } from './gifts.types'
import { CommunicationI } from '../communications/communication.types'
import { UserI, UserModel } from '../users/users.model'
import { CommunicationModel } from '../communications/communication.model'
import { SpaceMemberModel, SpaceModel } from '../spaces/spaces.model'
import { SpaceTypesEnum } from '../spaces/spaces.types'
import { UserShortPublicResponse } from '../users/users.responses'

export type GiftResponse = {
	uid: string
	name: string
	url: string
	value: number
	amount: number
}

export type GiftUserResponse = {
	gift: GiftResponse
	user: UserShortPublicResponse
	sender: UserShortPublicResponse
	createdAt: Date
	updatedAt: Date
}

const giftsService = {
	async getList(data: giftGetListDto): Promise<GiftResponse[]> {
		const gifts = await GiftModel.find({})
			.skip(data.offset)
			.limit(data.limit)
			.exec()
		return gifts.map(gift => ({
			uid: String(gift._id),
			name: gift.name,
			url: gift.url,
			value: gift.value,
			amount: gift.amount,
		}))
	},

	async getOfUser(userId: string): Promise<GiftUserResponse[]> {
		const giftUsers = await GiftUserModel.find({ userId })
			.sort({ createdAt: -1 })
			.populate<{
				giftId: HydratedDocument<GiftI>
				userId: HydratedDocument<UserI>
				senderId: HydratedDocument<UserI>
			}>('giftId userId senderId')
			.exec()

		return giftUsers.map(giftUser => ({
			tid: String(giftUser._id),
			gift: {
				uid: String(giftUser.giftId._id),
				name: giftUser.giftId.name,
				url: giftUser.giftId.url,
				value: giftUser.giftId.value,
				amount: giftUser.giftId.amount,
			},
			user: {
				id: String(giftUser.userId._id),
				username: giftUser.userId.username,
				img: giftUser.userId.img,
			},
			sender: {
				id: String(giftUser.senderId._id),
				username: giftUser.senderId.username,
				img: giftUser.senderId.img,
			},
			createdAt: giftUser.createdAt,
			updatedAt: giftUser.updatedAt,
		}))
	},
	async send(data: giftSendDto, userId: Types.ObjectId) {
		const gift = await GiftModel.findById(data.uid)
		if (!gift) throw new Error('Gift not found')
		if (!(gift.amount > 0)) throw new Error('Gift was sold out')

		const user = await UserModel.findById(userId)
		if (!user) throw new Error('User not found')

		const receiver = await UserModel.findById(data.userId)
		if (!receiver) throw new Error('Receiver not found')

		if (user.currency < gift.value) throw new Error('Insufficient funds')

		// Send the gift
		// #TODO Make it annonymous

		const giftUser = new GiftUserModel({
			giftId: gift._id,
			userId: receiver._id,
			senderId: user._id,
			text: data.text,
			isAnonym: data.anonymous,
		})
		await giftUser.save()

		gift.amount -= 1
		await gift.save()

		user.currency -= gift.value
		await user.save()

		return giftUser
	},
	async sell(data: giftSellDto, userId: Types.ObjectId) {
		const transaction = await GiftUserModel.findById(data.transactionId)
		if (!transaction) throw new Error('Transaction not found')

		const user = await UserModel.findById(userId)
		const gift = await GiftModel.findById(transaction.giftId)

		if (String(transaction.userId) !== String(userId))
			throw new Error('You are not the owner of this gift')
		if (!gift) throw new Error('Gift not found')
		if (!user) throw new Error('User not found')

		// Return the gift
		await transaction.deleteOne()
		gift.amount += 1
		user.currency += gift.value * 0.75

		await gift.save()
		await user.save()
	}

	// async toggle(
	// 	data: emojiToggleDto,
	// 	userId: Types.ObjectId
	// ): Promise<{
	// 	emoji: EmojiCommunicationResponse
	// 	action: 'removed' | 'added'
	// }> {
	// 	const emoji = await EmojiCommunicationModel.findOne({
	// 		emojiId: data.emojiId,
	// 		userId,
	// 		communicationId: data.communicationId,
	// 	})
	// 	if (emoji) {
	// 		const populated = await emoji.populate<{
	// 			emojiId: HydratedDocument<EmojiI>
	// 			communicationId: HydratedDocument<CommunicationI>
	// 			userId: HydratedDocument<UserI>
	// 		}>('emojiId communicationId userId')
	// 		await EmojiCommunicationModel.deleteOne({ _id: emoji._id })
	// 		return {
	// 			emoji: {
	// 				emoji: {
	// 					emojiUniqueId: String(populated.emojiId._id),
	// 					emojiName: populated.emojiId.name,
	// 					emojiUrl: populated.emojiId.url,
	// 				},
	// 				communicationId: String(populated.communicationId._id),
	// 				spaceId: String(populated.communicationId.spaceId),
	// 				user: {
	// 					id: populated.userId._id.toString(),
	// 					username: populated.userId.username,
	// 					img: populated.userId.img,
	// 				},
	// 				createdAt: populated.createdAt,
	// 				updatedAt: populated.updatedAt,
	// 			},
	// 			action: 'removed',
	// 		}
	// 	} else {
	// 		const emojiExists = await EmojiModel.findById(data.emojiId)
	// 		if (!emojiExists) {
	// 			throw new Error('Emoji not found')
	// 		}
	// 		const communicationExists = await CommunicationModel.findOneOrError({
	// 			_id: data.communicationId,
	// 		})

	// 		const space = await SpaceModel.findById(communicationExists.spaceId)
	// 		if (!space) throw new Error('Space not found')
	// 		const member = await SpaceMemberModel.findOne({
	// 			spaceId: communicationExists.spaceId,
	// 			userId,
	// 		})
	// 		if (
	// 			space.type !== SpaceTypesEnum.POSTS &&
	// 			(!member || member.isBaned || member.isMuted)
	// 		)
	// 			throw new Error('You are banned or muted in this space')

	// 		const userEmojis = await EmojiCommunicationModel.find({
	// 			userId,
	// 			communicationId: data.communicationId,
	// 		})
	// 		if (userEmojis.length >= 3) {
	// 			throw new Error('You can only use 3 emojis per communication')
	// 		}

	// 		const newEmoji = await EmojiCommunicationModel.create({
	// 			emojiId: data.emojiId,
	// 			userId,
	// 			communicationId: data.communicationId,
	// 		})
	// 		const populated = await newEmoji.populate<{
	// 			emojiId: HydratedDocument<EmojiI>
	// 			communicationId: HydratedDocument<CommunicationI>
	// 			userId: HydratedDocument<UserI>
	// 		}>('emojiId communicationId userId')
	// 		return {
	// 			emoji: {
	// 				emoji: {
	// 					emojiUniqueId: String(populated.emojiId._id),
	// 					emojiName: populated.emojiId.name,
	// 					emojiUrl: populated.emojiId.url,
	// 				},
	// 				communicationId: String(populated.communicationId._id),
	// 				spaceId: String(populated.communicationId.spaceId),
	// 				user: {
	// 					id: populated.userId._id.toString(),
	// 					username: populated.userId.username,
	// 					img: populated.userId.img,
	// 				},
	// 				createdAt: populated.createdAt,
	// 				updatedAt: populated.updatedAt,
	// 			},
	// 			action: 'added',
	// 		}
	// 	}
	// },
}

export default giftsService
