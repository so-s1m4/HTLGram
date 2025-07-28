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
    media: string[]
}

export const deleteMediaCommunicationSchema = Joi.object<deleteMediaCommunicationSchemaI>({
    media: Joi.array()
        .items(
            Joi.string()
            .length(24)
            .hex()
            .required()
        )
        .min(1)
        .max(20)
        .required()
})

export interface deleteMessagesCommunicationSchemaI {
    messages: string[]
}

export const deleteMessagesCommunicationSchema = Joi.object<deleteMessagesCommunicationSchemaI>({
    messages: Joi.array()
        .items(
            Joi.string()
            .length(24)
            .hex()
            .required()
        )
        .min(1)
        .max(50)
        .required()
})