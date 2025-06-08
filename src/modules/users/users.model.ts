import {Model, Schema, model} from 'mongoose'

export interface UserI extends Document {
    username: string,
    password: string,
    name: string,
    description?: string, 
    img?: string
}

const userSchema = new Schema<UserI>({
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        img: {
            type: String
        }
    },
    {
        timestamps: true, // createdAt and updatedAt
    })

export const userModel: Model<UserI> = model<UserI>('User', userSchema)
