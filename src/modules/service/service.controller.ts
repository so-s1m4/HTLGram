import { Request, Response, NextFunction } from 'express'
import serviceService from './service.service'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'
import { validationWrapper } from '../../common/utils/utils.wrappers'
import { CreateServiceDto, CreateServiceSchema, GetServiceListDto, GetServiceListSchema } from './service.dto'

const serviceController = {
	async getServicesList(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<GetServiceListDto>(
			GetServiceListSchema,
			req.body || {}
		)
    const services = await serviceService.getServicesList(dto)
    res.status(200).json({ data: services })
	},
	async createService(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<CreateServiceDto>(
			CreateServiceSchema,
			req.body || {}
		)
		const service = await serviceService.createService(dto)
		res.status(201).json({ data: service })
	},
	async getServiceById(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const serviceId = req.params.id
		const service = await serviceService.getServiceById(serviceId)
		res.status(201).json({ data: service })
	},
	async updateServiceById(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const serviceId = req.params.id
    const dto = req.body
    const service = await serviceService.updateServiceById(serviceId, dto)
    res.status(200).json({ data: service })
		
	},
	async deleteServiceById(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const serviceId = req.params.id
		await serviceService.deleteServiceById(serviceId)
		res.status(204).send()
	},
}

export default serviceController
