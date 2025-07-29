import Joi from 'joi'


export const getListCommunicationSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required(),
    skip: Joi.number().positive().default(0),
    limit: Joi.number().positive().default(100)
})


export const closeCommunicationSchema = Joi.object({
    communicationId: Joi.string().trim().min(3).max(64).required()
})
