import Joi from 'joi'


export const createChatSchema = Joi.object({
    userId: Joi.string().trim().min(3).max(64).required()
})

