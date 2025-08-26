import { ImageInfoI } from "../../modules/users/users.model";
import { HydratedDocument, Model, Schema, Types } from "mongoose";

export const enum SpaceTypesEnum {
    POSTS = "posts",
    CHAT = "chat",
    CHANEL = "channel",
    GROUP = "group"
}

export interface BaseSpaceI {
    _id: Schema.Types.ObjectId,
    type: string,
    maxMessageSeq: number,
    createdAt: Date,
    updatedAt: Date,
    // members?: any[],
    // lastMessage?: any,
    // unreadmessages?: number
    // img?: ImageInfoI[]
}

export interface PostsI extends BaseSpaceI {
    owner: Schema.Types.ObjectId
}

export interface ChatI extends BaseSpaceI {
    user1_id: Schema.Types.ObjectId,
    user2_id: Schema.Types.ObjectId
}

export interface GroupI extends BaseSpaceI {
    group: Types.ObjectId;
    owner: Schema.Types.ObjectId,
    title: string,
    img: ImageInfoI[]
}

export enum SpaceRolesEnum {
    MEMBER = "member",
    ADMIN = "admin"
}

export interface SpaceMemberI {
    spaceId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    role: SpaceRolesEnum,
    isMuted: boolean,
    isBaned: boolean,
    lastReadSeq: number
}

export interface SpaceMemberModelI extends Model<SpaceMemberI> {
  findOneOrError(filter: object): Promise<HydratedDocument<SpaceMemberI>>;
}