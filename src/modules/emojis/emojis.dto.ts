import Joi from "joi"

export type emojiGetListDto = {
    limit: number,
    offset: number
}

export const emojiGetListSchema = Joi.object<emojiGetListDto>({
    limit: Joi.number().integer().min(1).default(8),
    offset: Joi.number().integer().min(0).default(0)
})