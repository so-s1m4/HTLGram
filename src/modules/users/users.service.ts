import {UserI, userModel} from "./users.model"
import bcrypt from 'bcryptjs'
import {config} from '../../config/config'
import {ErrorWithStatus} from '../../common/middlewares/errorHandlerMiddleware'

export async function createUser(data: UserI) {
    const oldUser = await userModel.findOne({username:data.username})
    if (oldUser) throw new ErrorWithStatus(400, "User with such username already exist")

    data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT)
    const user = await userModel.create(data)
    const {password, ...userObject} = user.toObject()
    return userObject
}