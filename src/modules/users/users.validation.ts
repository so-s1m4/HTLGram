import Joi from 'joi'

export const createUserSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().trim().min(3).max(64).required(),
    name: Joi.string().trim().min(3).max(64).required(),
    description: Joi.string().trim().max(512), 
    img: Joi.string(),
})



export const updateUserSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64),
    password: Joi.string().trim().min(3).max(64),
    name: Joi.string().trim().min(3).max(64),
    description: Joi.string().trim().max(512), 
    img: Joi.string()
}).min(1)
