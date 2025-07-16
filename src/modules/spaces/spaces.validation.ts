import Joi from 'joi'

export const createChatOrGroupOrChanelSchema = Joi.object({
    type: Joi.string().valid("chat", "group", "chanel").required(),
    title: Joi.string().trim().min(3).max(64).required()
})

export const updateSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required(),
    data: Joi.object({
        title: Joi.string().trim().min(3).max(64).required()
    }).required()
})

export const deleteSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required()
})

