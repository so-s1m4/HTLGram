import Joi from 'joi'

export type deleteSpaceDto = {
    spaceId: string
}

export const deleteSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(24).max(24).required()
})

export type getInfoSpaceDto = {
    spaceId: string
}

export const getInfoSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(24).max(24).required()
})

export type readMessagesDto = {
    spaceId: string,
    messageSeq: number
}

export const readMessagesSchema = Joi.object({
    spaceId: Joi.string().trim().min(24).max(24).required(),
    messageSeq: Joi.number().positive().required()
})