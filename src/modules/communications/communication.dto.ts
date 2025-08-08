import Joi from 'joi'


export type getLIstCommunicationDto = {
    spaceId: string;
    skip: number;
    limit: number;
}

export const getListCommunicationSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required(),
    skip: Joi.number().positive().default(0),
    limit: Joi.number().positive().default(100)
})

export type closeCommunicationDto = {
    communicationId: string;
}

export const closeCommunicationSchema = Joi.object({
    communicationId: Joi.string().trim().min(3).max(64).required()
})

export type createCommunicationDto = {
    spaceId: string;
    text?: string;
    repliedOn?: string;
}

export const createCommunicationSchema = Joi.object<createCommunicationDto>({
    spaceId: Joi.string().trim().min(24).max(24).required(),
    text: Joi.string().trim().max(10000).allow('').optional(),
    repliedOn: Joi.string().trim().length(24).hex().optional(),
})

export type updateCommunicationDto = {
    communicationId: string;
    text: string;
}

export const updateCommunicationSchema = Joi.object({
    communicationId: Joi.string().trim().min(24).max(24).required(),
    text: Joi.string().trim().max(10000).required()
})

export type deleteMediaCommunicationDto = {
    media: string[]
}

export const deleteMediaCommunicationSchema = Joi.object<deleteMediaCommunicationDto>({
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

export type deleteMessagesCommunicationDto = {
    messages: string[]
}

export const deleteMessagesCommunicationSchema = Joi.object<deleteMessagesCommunicationDto>({
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