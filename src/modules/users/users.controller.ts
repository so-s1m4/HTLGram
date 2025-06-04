import {UserI, userModel} from './users.model'
import {createUserSchema, updateUserSchema} from './users.validation'
import { createUser } from './users.service'
import {Request, Response, NextFunction} from 'express'
import validationWrapper from '../../common/utils/util.validationWrapper'
import Joi from 'joi'

export async function postUser(req: Request, res: Response, next: NextFunction) {
    try {
        const data = validationWrapper(createUserSchema, req.body || {})
        const user = await createUser(data)
        res.status(201).json({data: user})
    } catch (error) {
        next(error)
    }
}