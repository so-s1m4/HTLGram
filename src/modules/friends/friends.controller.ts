import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Request, Response, NextFunction } from "express";
import { createFriendRequestSchema, updateFriendRequestSchema } from "./friends.validation";
import { createFriendRequest, updateFriendRequest } from "./friends.service";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";

export async function postFriendRequest(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const data = validationWrapper(createFriendRequestSchema, req.body || {})
    const friendRequest = await createFriendRequest(userId, data.receiver, data.text)
    res.status(201).json({data: friendRequest})
} 

export async function patchFriendRequest(req: Request, res: Response, next: NextFunction) {
    const requestId = req.params['requestId']
    if (!requestId) throw new ErrorWithStatus(400, "'requestId' in params is missing")
    const userId = res.locals.user.userId
    const data = validationWrapper(updateFriendRequestSchema, req.body || {})
    const updated = await updateFriendRequest(requestId, userId, data.status)
    res.status(200).json({data: updated})
}