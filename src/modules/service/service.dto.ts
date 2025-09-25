import Joi from "joi"

export type GetServiceListDto = {
	startsWith: string
	offSet: number
	limit: number
}
export const GetServiceListSchema = Joi.object<GetServiceListDto>({
    startsWith: Joi.string().trim().min(1).max(64).default(''),
    offSet: Joi.number().min(0).default(0),
    limit: Joi.number().min(0).default(10),
})

export type CreateServiceDto = {
  name: string
  duration: number // in minutes
  price: number // in euros
}
export const CreateServiceSchema = Joi.object<CreateServiceDto>({
  name: Joi.string().trim().min(1).max(128).required(),
  duration: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
})

export type UpdateServiceDto = {
  name?: string
  duration?: number // in minutes
  price?: number // in euros
}
export const UpdateServiceSchema = Joi.object<UpdateServiceDto>({
  name: Joi.string().trim().min(1).max(128).optional(),
  duration: Joi.number().min(1).optional(),
  price: Joi.number().min(0).optional(),
}).or('name', 'duration', 'price') // At least one of the fields must be present
