import Joi from "joi";

export type TimeItemType = 'work' | 'break' | 'booking';

export type CreateTimeItemDto = {
	date: Date
	userId: string

	type: TimeItemType
	clientId?: string
	serviceId?: string

	timeStart: number
	timeEnd: number
}
export const CreateTimeItemSchema = Joi.object<CreateTimeItemDto>({
    date: Joi.date().required(),
    userId: Joi.string().hex().length(24).required(),

    type: Joi.string().valid('work', 'break', 'booking').required(),
    clientId: Joi.when('type', {
        is: 'booking',
        then: Joi.string().hex().length(24).required(),
        otherwise: Joi.forbidden()
    }),
    serviceId: Joi.when('type', {
        is: 'booking',
        then: Joi.string().hex().length(24).required(),
        otherwise: Joi.forbidden()
    }),

    timeStart: Joi.number().min(0).max(1440).required(),
    timeEnd: Joi.number().min(0).max(1440).greater(Joi.ref('timeStart')).required()
})

export type UpdateTimeItemDto = {
    date?: Date
    userId?: string

    type?: TimeItemType
    clientId?: string
    serviceId?: string

    timeStart?: number
    timeEnd?: number
}
export const UpdateTimeItemSchema = Joi.object<UpdateTimeItemDto>({
    date: Joi.date().optional(),
    userId: Joi.string().hex().length(24).optional(),

    type: Joi.string().valid('work', 'break', 'booking').optional(),
    clientId: Joi.when('type', {
        is: 'booking',
        then: Joi.string().hex().length(24).required(),
        otherwise: Joi.forbidden()
    }),
    serviceId: Joi.when('type', {
        is: 'booking',
        then: Joi.string().hex().length(24).required(),
        otherwise: Joi.forbidden()
    }),

    timeStart: Joi.number().min(0).max(1440).optional(),
    timeEnd: Joi.number().min(0).max(1440).greater(Joi.ref('timeStart')).optional()
}).or('date', 'userId', 'type', 'clientId', 'serviceId', 'timeStart', 'timeEnd');

export type GetTimeItemsDto = {
    dateFrom?: Date
    dateTo?: Date
    userId?: string
    clientId?: string
    serviceId?: string
    type?: TimeItemType
}
export const GetTimeItemsSchema = Joi.object<GetTimeItemsDto>({
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    userId: Joi.string().hex().length(24).optional(),
    clientId: Joi.string().hex().length(24).optional(),
    serviceId: Joi.string().hex().length(24).optional(),
    type: Joi.string().valid('work', 'break', 'booking').optional()
}).and('dateFrom', 'dateTo');


