import Joi from 'joi'
import { Types } from 'mongoose'

export type createGroupDto = {
    title: string
}

export const createGroupSchema = Joi.object<createGroupDto>({
    title: Joi.string().trim().min(3).max(25).required()
})

