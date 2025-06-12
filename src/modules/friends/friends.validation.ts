import joi from 'joi'

export const createFriendRequestSchema = joi.object({
    sender: joi.string().required(),
    receiver: joi.string().required(),
    status: joi.string().valid('sent', 'accepted', 'canceled').required()
})

export const updateFriendRequestSchema = joi.object({
    status: joi.string().valid('sent', 'accepted', 'canceled').required()
})


export const getFriendRequestSchema = joi.object({
    status: joi.string().valid('sent', 'accepted', 'canceled').required()
})
