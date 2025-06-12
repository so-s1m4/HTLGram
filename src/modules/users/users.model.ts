import {Model, Schema, model} from 'mongoose'

export interface ImageInfo {
  path: string;
  size: number;
}

const imageInfoSchema = new Schema<ImageInfo>(
  {
    path: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { _id: false }
);

export interface UserI extends Document {
    username: string,
    password: string,
    name: string,
    description?: string, 
    img?: ImageInfo[],
    role: string[],
    storageUsed: number
}

const userSchema = new Schema<UserI>({
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        img: {
            type: [imageInfoSchema],
            default: [],
            validate: {
                validator: arr => arr.length <= 20,
                message: 'Cannot have more than 20 images'
            }
        },
        role: {
            type: [String],
            enum: ['user', 'moderator', 'admin'],
            default: ['user']
        },
        storageUsed: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true, // createdAt and updatedAt
    })

export const userModel: Model<UserI> = model<UserI>('User', userSchema)
