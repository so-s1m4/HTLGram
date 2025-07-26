import Joi from 'joi'


export const createCommunicationSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required(),
    text: Joi.string().trim().max(10000).allow('').optional(),
})

export const getListCommunicationSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required(),
    skip: Joi.number().positive().default(0),
    limit: Joi.number().positive().default(100)
})


export const closeCommunicationSchema = Joi.object({
    communicationId: Joi.string().trim().min(3).max(64).required()
})


export const updateCommunicationSchema = Joi.object({
    communicationId: Joi.string().trim().min(3).max(64).required(),
    text: Joi.string().trim().max(10000).required()
})

export interface deleteMediaCommunicationSchemaI {
    mediaId: string
}

export const deleteMediaCommunicationSchema = Joi.object<deleteMediaCommunicationSchemaI>({
    mediaId: Joi.string().trim().min(3).max(64).required()
})