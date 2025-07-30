import Joi from 'joi'

export type CreateFriendRequestDto = {
    receiver: string,
    text?: string
}

export const CreateFriendRequestSchema = Joi.object({
    receiver: Joi.string().trim().min(24).max(24).required(),
    text: Joi.string().max(256)
})

export type UpdateFriendRequestDto = {
    requestId: string
}

export const UpdateFriendRequestSchema = Joi.object({
    requestId: Joi.string().trim().min(24).max(24).required(),
})

export type GetFriendRequestDto = {
    status: 'sent' | 'accepted' | 'canceled'
}

export const GetFriendRequestSchema = Joi.object({
    status: Joi.string().valid('sent', 'accepted', 'canceled').required()
})

export type DeleteFriendRequestDto = {
    requestId: string
}

export const DeleteFriendRequestSchema = Joi.object({
    requestId: Joi.string().trim().min(24).max(24).required()
})