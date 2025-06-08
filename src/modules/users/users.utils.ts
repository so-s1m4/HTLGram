import { HydratedDocument } from "mongoose"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { UserI, userModel } from "./users.model"


export async function findUser(filter: object): Promise<HydratedDocument<UserI>> {
    const user: HydratedDocument<UserI> | null = await userModel.findOne(filter).exec()
    if (!user) throw new ErrorWithStatus(400, "User was not found")
    return user
}
