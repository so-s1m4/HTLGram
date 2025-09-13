import { HydratedDocument, MergeType, PopulatedDoc, Types } from 'mongoose'
import { giftGetListDto } from './gifts.dto'
import { GiftUserModel, GiftModel } from './gifts.model'
import { GiftUserI, GiftI } from './gifts.types'
import { CommunicationI } from '../communications/communication.types'
import { UserI } from '../users/users.model'
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
	createdAt: Date
	updatedAt: Date
}

const emojisService = {
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

export default emojisService
