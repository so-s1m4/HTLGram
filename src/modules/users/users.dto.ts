import Joi from 'joi'

export type GetUsersListDto = {
    startsWith: string;
    offSet: number;
    limit: number;
}

export const GetUsersListSchema = Joi.object<GetUsersListDto>({
    startsWith: Joi.string().trim().min(1).max(64).required(),
    offSet: Joi.number().min(0).default(0),
    limit: Joi.number().min(0).default(10)
})

export type RegisterUserDto = {
    username: string;
    password: string;
    name: string;
    description?: string;
}

export const RegisterUserSchema = Joi.object<RegisterUserDto>({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().trim().min(3).max(64).required(),
    name: Joi.string().trim().min(3).max(64).required(),
    description: Joi.string().trim().max(512)
})

export type LoginUserDto = {
    username: string;
    password: string;
}

export const LoginUserSchema = Joi.object<LoginUserDto>({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().trim().min(3).max(64).required(),
})

export type UpdateMyDataDto = {
    password?: string;
    name?: string;
    description?: string;
}

export const UpdateMyDataSchema = Joi.object<UpdateMyDataDto>({
    password: Joi.string().trim().min(3).max(64),
    name: Joi.string().trim().min(3).max(64),
    description: Joi.string().trim().max(512)
}).min(1)

export type DeleteFriend = {
    friendId: string;
}

export const DeleteFriendSchema = Joi.object<DeleteFriend>({
    friendId: Joi.string().trim().min(24).max(24).required()
})

export type GetUserDataDto = {
    userId: string;
}

export const GetUserDataSchema = Joi.object<GetUserDataDto>({
    userId: Joi.string().trim().min(24).max(24).required()
})