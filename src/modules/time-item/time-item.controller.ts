import { validationWrapper } from '../../common/utils/utils.wrappers'
import { Request, Response, NextFunction } from 'express'

import timeItemService from './time-item.service'
import { CreateTimeItemDto, CreateTimeItemSchema, GetTimeItemsDto, GetTimeItemsSchema, UpdateTimeItemDto, UpdateTimeItemSchema } from './time-item.dto'

const TimeItemController = {
  async create(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
		const dto = validationWrapper<CreateTimeItemDto>(
			CreateTimeItemSchema,
			req.body || {}
		)
		const timeItem = await timeItemService.createTimeItem(userId, dto)
		res.status(200).json({ data: timeItem })
  },
  async getAll(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const dto = validationWrapper<GetTimeItemsDto>(
      GetTimeItemsSchema,
      req.body || {}
    )
    const timeItems = await timeItemService.getTimeItems(dto)
    res.status(200).json({ data: timeItems })
  },
  async getMy(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const dto = validationWrapper<GetTimeItemsDto>(
      GetTimeItemsSchema,
      req.body || {}
    )
    const timeItems = await timeItemService.getMyTimeItems(userId, dto)
    res.status(200).json({ data: timeItems })
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const timeItemId = req.params.id
    const timeItem = await timeItemService.getTimeItemById(timeItemId)
    res.status(200).json({ data: timeItem })
  },
  async update(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const timeItemId = req.params.id
    const dto = validationWrapper<UpdateTimeItemDto>(
      UpdateTimeItemSchema,
      req.body || {}
    )
    const timeItem = await timeItemService.updateTimeItem(timeItemId, dto)
    res.status(200).json({ data: timeItem })
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const timeItemId = req.params.id
    await timeItemService.deleteTimeItem(timeItemId)
    res.status(204).send()
  }
}

export default TimeItemController