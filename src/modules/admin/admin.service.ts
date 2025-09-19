import { GiftModel, GiftUserModel } from '../gifts/gifts.model'
import { UserModel } from '../users/users.model'
import { EmojiModel } from '../emojis/emojis.model'
import { CommunicationModel } from '../communications/communication.model'
import usersService from '../users/users.service'
import { create } from 'domain'

const adminService = {
	users: {
		getUsersList: async (filter = {}) => {
			const users = await UserModel.find(filter).select('-password').select('-__v')
			return users
		},
		createUser: async (data: any) => {
			await usersService.register({ ...data })
			const user = await UserModel.findOne({ username: data.username })
			return user
		},
		getUserById: async (userId: string) => {
			const user = await UserModel.findById(userId).select('-password')
			return user
		},
    updateUserById: async (userId: string, data: Partial<typeof UserModel>) => {
			const user = await UserModel.findByIdAndUpdate(userId, data, { new: true }).select('-password')
			return user
		},
		deleteUserById: async (userId: string) => {
			const user = await UserModel.findByIdAndDelete(userId).select('-password')
			return user
		},
		getUserGifts: async (userId: string) => {
			const gifts = await GiftUserModel.find({ userId: userId })
			return gifts
		},
		createUserGift: async (userId: string, data: Partial<typeof GiftUserModel>) => {
			const gift = await GiftUserModel.create({ userId, ...data })
			return gift
		},
		getUserGiftsById: async (userId: string, giftId: string) => {
			const gift = await GiftUserModel.findOne({ userId: userId, _id: giftId })
			return gift
		},
		updateUserGiftById: async (userId: string, giftId: string, data: Partial<typeof GiftUserModel>) => {
			const gift = await GiftUserModel.findOneAndUpdate(
				{ userId: userId, _id: giftId },
				data,
				{ new: true }
			)
			return gift
		},
		deleteUserGiftById: async (userId: string, giftId: string) => {
			const gift = await GiftUserModel.findOneAndDelete({
				userId: userId,
				_id: giftId,
			})
			return gift
		},
	},
	messages: {
		getMessages: async (filter = {}) => {
			const messages = await CommunicationModel.find(filter)
			return messages
		},
		createMessage: async (data: any) => {
			const message = await CommunicationModel.create(data)
			return message
		},
		getMessageById: async (messageId: string) => {
			const message = await CommunicationModel.findById(messageId)
			return message
		},
    updateMessageById: async (messageId: string, data: any) => {
      const message = await CommunicationModel.findByIdAndUpdate(messageId, data, { new: true })
      return message
    },
    deleteMessageById: async (messageId: string) => {
      const message = await CommunicationModel.findByIdAndDelete(messageId)
      return message
    },
	},
	gifts: {
		getGifts: async (filter = {}) => {
			const gifts = await GiftModel.find(filter)
			return gifts
		},
		createGift: async (data: any) => {
			const gift = await GiftModel.create(data)
			return gift
		},
		getGiftById: async (giftId: string) => {
			const gift = await GiftModel.findById(giftId)
			return gift
		},
		updateGiftById: async (
			giftId: string,
			data: Partial<typeof GiftModel>
		) => {
			const gift = await GiftModel.findByIdAndUpdate(giftId, data, {
				new: true,
			})
			return gift
		},
		deleteGiftById: async (giftId: string) => {
			const gift = await GiftModel.findByIdAndDelete(giftId)
			return gift
		},
	},
	emojis: {
		getEmojis: async (filter = {}) => {
			const emojis = await EmojiModel.find(filter)
			return emojis
		},
		createEmoji: async (data: any) => {
			const emoji = await EmojiModel.create(data)
			return emoji
		},
		getEmojiById: async (emojiId: string) => {
			const emoji = await EmojiModel.findById(emojiId)
			return emoji
		},
		updateEmojiById: async (emojiId: string, data: any) => {
			const emoji = await EmojiModel.findByIdAndUpdate(emojiId, data, {
				new: true,
			})
			return emoji
		},
		deleteEmojiById: async (emojiId: string) => {
			const emoji = await EmojiModel.findByIdAndDelete(emojiId)
			return emoji
		},
	},
}
export default adminService
