import { model, Schema, Types } from "mongoose";
import { SpaceI, SpaceMemberI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types";
import { imageInfoSchema } from "../users/users.model";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";

const SpaceSchema = new Schema<SpaceI>(
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
        timestamps: true
    }
)

export const SpaceModel = model<SpaceI>("Space", SpaceSchema)

const SpaceMemberSchema = new Schema<SpaceMemberI>(
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
    }
)

export const SpaceMemberModel = model<SpaceMemberI>("SpaceMember", SpaceMemberSchema)