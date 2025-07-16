import { HydratedDocument, Model, model, Schema, Types } from "mongoose";
import { SpaceI, SpaceMemberI, SpaceMemberModelI, SpaceModelI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types";
import { imageInfoSchema } from "../users/users.model";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";

const SpaceSchema = new Schema<SpaceI, SpaceModelI>(
    {
        type: {
            type: String,
            enum: Object.values(SpaceTypesEnum),
            required: true,
            index: 1
        },
        owner: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: 1
        },
        title: {
            type: String,
            maxlength: 100
        },
        img: {
            type: [imageInfoSchema],
            default: [],
            validate: {
                validator: arr => arr.length <= 10,
                message: 'Cannot have more than 10 images'
            }
        }
    },
    {   
        statics: {
            async findOneOrError(filter: object) {
                const space = await this.findOne(filter).exec();
                
                if (!space) throw new ErrorWithStatus(404, 'Was not found');
                return space;
            }
        },
        timestamps: true
    }
)

export const SpaceModel = model<SpaceI, SpaceModelI>("Space", SpaceSchema)

const SpaceMemberSchema = new Schema<SpaceMemberI, SpaceMemberModelI>(
    {
        space_id: {
            type: Types.ObjectId,
            ref: "Space",
            required: true,
            index: 1
        }, 
        user_id: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: 1
        },
        role: {
            type: String,
            enum: Object.values(SpaceRolesEnum),
            default: SpaceRolesEnum.MEMBER
        },
        isMuted: {
            type: Boolean,
            default: false
        },
        isBaned: {
            type: Boolean,
            default: false
        }
    },
    {
        statics: {
            async findOneOrError(filter: object) {
                const spaceMember = await this.findOne(filter).exec();
                
                if (!spaceMember) throw new ErrorWithStatus(404, 'Was not found');
                return spaceMember;
            }
        },
    }
)

export const SpaceMemberModel = model<SpaceMemberI, SpaceMemberModelI>("SpaceMember", SpaceMemberSchema)