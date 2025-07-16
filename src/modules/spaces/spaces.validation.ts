import Joi from 'joi'

export const createChatOrGroupOrChanelSchema = Joi.object({
    type: Joi.string().valid("chat", "group", "chanel").required(),
    title: Joi.string().trim().min(3).max(64).required()
})