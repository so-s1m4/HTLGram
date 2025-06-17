import Joi from 'joi'

export const receiveUsersSchema = Joi.object({
    startsWith: Joi.string().trim().min(1).max(64).required(),
    offSet: Joi.number().min(0).default(0),
    limit: Joi.number().min(0).default(10)
})

export const createUserSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().trim().min(3).max(64).required(),
    name: Joi.string().trim().min(3).max(64).required(),
    description: Joi.string().trim().max(512)
})

export const loginUserSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().trim().min(3).max(64).required(),
})

export const updateUserSchema = Joi.object({
    password: Joi.string().trim().min(3).max(64),
    name: Joi.string().trim().min(3).max(64),
    description: Joi.string().trim().max(512)
}).min(1)
