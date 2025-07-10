import { ImageInfoI } from "../users/users.model";
import { Schema, Types } from "mongoose";

export enum SpaceTypesEnum {
    CHAT = "chat",
    GROUP = "group",
    POSTS = "posts"
}

export interface SpaceI {
    type: SpaceTypesEnum,
    owner: Schema.Types.ObjectId,
    title?: string,
    img: ImageInfoI[],
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