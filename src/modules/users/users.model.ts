import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';
import {Model, Schema, model, Types, HydratedDocument} from 'mongoose'

export interface ImageInfoI {
  path: string;
  size: number;
}

export const imageInfoSchema = new Schema<ImageInfoI>(
  {
    path: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { _id: false }
);

export interface UserI {
    _id: Schema.Types.ObjectId,
    username: string
    password: string,
    name: string,
    description?: string, 
    img: ImageInfoI[],
    friendsCount: number,
    createdAt: Date,
    updatedAt: Date
}

export interface UserModel extends Model<UserI> {
  findOneOrError(filter: object): Promise<HydratedDocument<UserI>>;
}

const userSchema = new Schema<UserI, UserModel>({
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
                validator: arr => arr.length <= 10,
                message: 'Cannot have more than 10 images'
            }
        },
        friendsCount: {
            type: Number,
            default: 0
        }
    },
    {   
        statics: {
            async findOneOrError(filter: object) {
                const user = await this.findOne(filter).exec();
                
                if (!user) throw new ErrorWithStatus(404, 'User was not found');
                return user;
            }
        },
        timestamps: true, // createdAt and updatedAt
    })

export const userModel = model<UserI, UserModel>('User', userSchema)
