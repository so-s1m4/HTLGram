import { HydratedDocument, Model, Schema, SchemaTimestampsConfig, Types } from "mongoose";

export const enum SpaceTypesEnum {
    POSTS = "Posts",
    CHAT = "chat"
}

export interface BaseSpaceI extends Document, SchemaTimestampsConfig {
    _id: Schema.Types.ObjectId,
    type: string;
}

export interface PostsI {
    owner: Schema.Types.ObjectId
}

export interface ChatI {
    user1_id: Schema.Types.ObjectId,
    user2_id: Schema.Types.ObjectId
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
    isBaned: boolean
}

export interface SpaceMemberModelI extends Model<SpaceMemberI> {
  findOneOrError(filter: object): Promise<HydratedDocument<SpaceMemberI>>;
}