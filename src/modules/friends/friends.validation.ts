import joi from 'joi'

export const createFriendRequestSchema = joi.object({
    receiver: joi.string().required()
})

export const updateFriendRequestSchema = joi.object({
    status: joi.string().valid('accepted', 'canceled').required()
})


export const getFriendRequestSchema = joi.object({
    status: joi.string().valid('sent', 'accepted', 'canceled').required()
})
