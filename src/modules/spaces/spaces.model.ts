import { model, Schema, SchemaTimestampsConfig, Types } from "mongoose";
import { BaseSpaceI, ChatI, GroupI, PostsI, SpaceMemberI, SpaceMemberModelI, SpaceRolesEnum, SpaceTypesEnum} from "./spaces.types";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { imageInfoSchema } from "../../modules/users/users.model";

const SpaceSchema = new Schema<BaseSpaceI>(
    {
        maxMessageSeq: {
            type: Number,
            default: 0
        }
    },
    {   
        timestamps: true,
        discriminatorKey: "type"
    }
)

export const SpaceModel = model<BaseSpaceI>("Space", SpaceSchema)

const ChatSchema = new Schema<ChatI>(
    {
        user1_id: { 
            type: Types.ObjectId, 
            ref: 'User', 
            required: true, 
            index: true 
        },
        user2_id: { 
            type: Types.ObjectId, 
            ref: 'User', 
            required: true, 
            index: true 
        }
    },
    {
        discriminatorKey: 'type'
    }
)

ChatSchema.pre("validate", function (next) {
    if (this.user1_id.toString() === this.user2_id.toString()) {
        return next(new Error("user1_id and user2_id must be different"));
    }

    if (this.user1_id.toString() > this.user2_id.toString()) {
        [this.user1_id, this.user2_id] = [this.user2_id, this.user1_id];
    }
    next();
});

ChatSchema.index({user1_id: 1, user2_id: 1}, {unique: true})

export const ChatModel = SpaceModel.discriminator<ChatI>(SpaceTypesEnum.CHAT, ChatSchema)


const PostsSchema = new Schema<PostsI>(
    {
        owner: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        discriminatorKey: 'type'
    }
)

PostsSchema.index(
  { owner: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "Posts" } }
)


export const PostsModel = SpaceModel.discriminator<PostsI>(SpaceTypesEnum.POSTS, PostsSchema)


const GroupSchema = new Schema<GroupI>(
    {
        owner: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            maxLength: 25
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
        discriminatorKey: 'type'
    }
)

export const GroupModel = SpaceModel.discriminator<GroupI>(SpaceTypesEnum.GROUP, GroupSchema)


const SpaceMemberSchema = new Schema<SpaceMemberI, SpaceMemberModelI>(
    {
        spaceId: {
            type: Types.ObjectId,
            ref: "Space",
            required: true,
            index: 1
        }, 
        userId: {
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
        },
        lastReadSeq: {
            type: Number,
            default: 0
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

SpaceMemberSchema.index(
  { spaceId: 1, userId: 1 },
  { unique: true }
);


export const SpaceMemberModel = model<SpaceMemberI, SpaceMemberModelI>("SpaceMember", SpaceMemberSchema)