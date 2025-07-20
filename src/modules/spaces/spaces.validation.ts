import Joi from 'joi'


export const deleteSpaceSchema = Joi.object({
    spaceId: Joi.string().trim().min(3).max(64).required()
})

