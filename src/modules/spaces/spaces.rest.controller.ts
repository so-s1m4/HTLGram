import { validationWrapper } from '../../common/utils/utils.wrappers'
import {Request, Response, NextFunction} from 'express'
import { updateSpaceDto, updateSpaceSchema } from './spaces.dto'
import { Types } from "mongoose"
import spacesService from './spaces.service'

const spaceRestController = {
    async updateSpaceData(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
        req.body = req.file ? { ...req.body, file: {filename: req.file.filename, size: req.file.size}} : req.body || {}
        const dto = validationWrapper<updateSpaceDto>(updateSpaceSchema, req.body)
        const spaceId = new Types.ObjectId(req.params.spaceId)
        const space = await spacesService.updateSpaceData(dto, userId, spaceId)
        res.status(200).json({data: space})
    },

    async deleteSpacePhoto(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
        const spaceId = new Types.ObjectId(req.params.spaceId)
        const photoPath = req.params.photoPath
        await spacesService.deleteSpacePhoto(userId, spaceId, photoPath)
        res.status(204).end()
    }
}

export default spaceRestController