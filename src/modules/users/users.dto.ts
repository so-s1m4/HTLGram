import Joi from 'joi'
import path from 'path';

export type GetUsersListDto = {
    startsWith: string;
    offSet: number;
    limit: number;
    role: 'admin' | 'master' | 'client';
}
export const GetUsersListSchema = Joi.object<GetUsersListDto>({
    startsWith: Joi.string().trim().min(1).max(64).default(''),
    offSet: Joi.number().min(0).default(0),
    limit: Joi.number().min(0).default(10),
    role: Joi.string().valid('admin', 'master', 'client')
})


export type RegisterUserDto = {
    username?: string;
    password?: string;
    name?: string;
    phone?: string;
    email?: string;
    role: 'admin' | 'master' | 'client';
}
export const RegisterUserSchema = Joi.object<RegisterUserDto>({
    username: Joi.string().trim().min(3).max(64).optional(),
    password: Joi.string().min(6).max(256).optional(),
    name: Joi.string().trim().min(1).max(128).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
    email: Joi.string().email().max(256).optional(),
    role: Joi.string().valid('admin', 'master', 'client').required()
}).custom((value, helpers) => {
    if (value.role === 'client') {
        if (value.username || value.password) {
            return helpers.error('any.custom', { message: 'Username and password are not allowed for client role' });
        }
        if (!value.name || !value.phone) {
            return helpers.error('any.custom', { message: 'Name and phone are required for client role' });
        }
        return value;
    }
    if (!value.username || !value.password) {
        return helpers.error('any.custom', { message: 'Username and password are required for admin and master roles' });
    }
    return value;
}, 'Custom validation for username and password based on role');

export type LoginUserDto = {
    username: string;
    password: string;
}
export const LoginUserSchema = Joi.object<LoginUserDto>({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().min(6).max(256).required(),
})

export type UpdateMyDataDto = {
    password?: string;
    email?: string;
    phone?: string;
}
export const UpdateMyDataSchema = Joi.object<UpdateMyDataDto>({
    password: Joi.string().min(6).max(256).optional(),
    email: Joi.string().email().max(256).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 format
}).or('password', 'email', 'phone');

export type DeleteClientDto = {
    clientId: string;
}
export const DeleteClientSchema = Joi.object<DeleteClientDto>({
    clientId: Joi.string().hex().length(24).required(),
});

export type UpdateUserDto = {
    name?: string;
    password?: string;
    email?: string;
    phone?: string;
}
export const UpdateUserSchema = Joi.object<UpdateUserDto>({
    name: Joi.string().trim().min(1).max(128).optional(),
    password: Joi.string().min(6).max(256).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    email: Joi.string().email().max(256).optional(),
}).or('name', 'password', 'email', 'phone');