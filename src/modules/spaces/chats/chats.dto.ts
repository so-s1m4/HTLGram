import Joi from 'joi'
import { Types } from 'mongoose'

export type createChatDto = {
    userId: Types.ObjectId
}

export const createChatSchema = Joi.object({
    userId: Joi.string().trim().min(3).max(64).required()
})

