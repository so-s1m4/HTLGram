import Joi from 'joi'
import { Types } from 'mongoose'

export type createGroupDto = {
    title: string,
    members?: string[]
}

export const createGroupSchema = Joi.object<createGroupDto>({
    title: Joi.string().trim().min(3).max(25).required(),
    members: Joi.array().items(Joi.string().trim().min(24).max(24)).optional()
})

export type membersListDto = {
    spaceId: string,
    members: string[]
}

export const membersListSchema = Joi.object<membersListDto>({
    spaceId: Joi.string().trim().min(24).max(24).required(),
    members: Joi.array().items(Joi.string().trim().min(24).max(24)).min(1).required()
})