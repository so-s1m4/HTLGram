import Joi from 'joi'

export type deleteSpaceDto = {
    spaceId: string
}

export const deleteSpaceSchema = Joi.object<deleteSpaceDto>({
    spaceId: Joi.string().trim().min(24).max(24).required()
})

export type getInfoSpaceDto = {
    spaceId: string
}

export const getInfoSpaceSchema = Joi.object<getInfoSpaceDto>({
    spaceId: Joi.string().trim().min(24).max(24).required()
})

export type readMessagesDto = {
    spaceId: string,
    messageSeq: number
}

export const readMessagesSchema = Joi.object<readMessagesDto>({
    spaceId: Joi.string().trim().min(24).max(24).required(),
    messageSeq: Joi.number().positive().required()
})

export type getMembersDto = {
    spaceId: string,
    limit: number,
    skip: number
}

export const getMembersSchema = Joi.object<getMembersDto>({
    spaceId: Joi.string().trim().min(24).max(24).required(),
    limit: Joi.number().min(0).default(50),
    skip: Joi.number().min(0).default(0)
})