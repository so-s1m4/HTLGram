import { ImageInfoI } from "../users/users.model";
import { HydratedDocument, Model, Schema, Types } from "mongoose";

export enum SpaceTypesEnum {
    CHAT = "chat",
    GROUP = "group",
    POSTS = "posts",
    CHANEL = "chanel"
}

export interface SpaceI {
    type: SpaceTypesEnum,
    owner: Schema.Types.ObjectId,
    title?: string,
    img?: ImageInfoI[],
}

export interface SpaceModelI extends Model<SpaceI> {
  findOneOrError(filter: object): Promise<HydratedDocument<SpaceI>>;
}

export enum SpaceRolesEnum {
    MEMBER = "member",
    ADMIN = "admin"
}

export interface SpaceMemberI {
    space_id: Schema.Types.ObjectId,
    user_id: Schema.Types.ObjectId,
    role: SpaceRolesEnum,
    isMuted: boolean,
    isBaned: boolean
}

export interface SpaceMemberModelI extends Model<SpaceMemberI> {
  findOneOrError(filter: object): Promise<HydratedDocument<SpaceMemberI>>;
}