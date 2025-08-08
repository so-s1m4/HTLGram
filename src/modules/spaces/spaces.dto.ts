import Joi from 'joi'

export type deleteSpaceDto = {
    spaceId: string
}

export const deleteSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required()
})

export type getInfoSpaceDto = {
    spaceId: string
}

export const getInfoSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required()
})

