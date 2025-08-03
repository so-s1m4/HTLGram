
import { HydratedDocument, MergeType  } from "mongoose";
import { EmojiCommunicationI, EmojiI } from "./emojis.types";
import { CommunicationI } from "../../modules/communications/communication.types";
import { UserI } from "../../modules/users/users.model";
import { ImageInfoR } from "../../modules/users/users.responses";

export type EmojiResponse = {
    id: string;
    name: string;
    url: string;
}

export type UserPublicResponse = {
    id: string;
    username: string;
    img: ImageInfoR[];
}

export type EmojiCommunicationResponse = {
    emoji: EmojiResponse
    communicationId: CommunicationResponse;
    userId: UserPublicResponse;
    createdAt: Date;
    updatedAt: Date;
}

export type EmojiCommunicationWithActionResponse = {
    emoji: EmojiCommunicationResponse;
    action: "added" | "removed";
}

export type CommunicationResponse = {
    id: string;
    spaceId: string;
}

export function toCommunicationResponse(communication: HydratedDocument<CommunicationI> | CommunicationI): CommunicationResponse {
    return {
        id: String(communication._id),
        spaceId: String(communication.spaceId)
    };
}

export function toUserPublicResponse(user: HydratedDocument<UserI> | UserI): UserPublicResponse {
    return {
        id: String(user._id),
        username: user.username,
        img: user.img
    };
}

export function toEmojiResponse(emoji: HydratedDocument<EmojiI> | EmojiI): EmojiResponse {
    return {
        id: String(emoji._id),
        name: emoji.name,
        url: emoji.url
    };
}

export function toEmojiResponseArray(emojis: HydratedDocument<EmojiI>[] | EmojiI[]): EmojiResponse[] {
    return emojis.map(toEmojiResponse);
}

export function toEmojiCommunicationResponse(emoji: MergeType<EmojiCommunicationI, {emojiId: EmojiI, communicationId: CommunicationI, userId: UserI}>): EmojiCommunicationResponse {
    return {
        emoji: toEmojiResponse(emoji.emojiId),
        communicationId: toCommunicationResponse(emoji.communicationId),
        userId: toUserPublicResponse(emoji.userId),
        createdAt: emoji.createdAt,
        updatedAt: emoji.updatedAt
    };
}

export function toEmojiCommunicationResponseArray(emojis: MergeType<EmojiCommunicationI, {emojiId: EmojiI, communicationId: CommunicationI, userId: UserI}>[]): EmojiCommunicationResponse[] {
    return emojis.map(toEmojiCommunicationResponse);
}

export function toEmojiCommunicationWithActionResponse(
    emoji: MergeType<EmojiCommunicationI, {emojiId: EmojiI, communicationId: CommunicationI, userId: UserI}>,
    action: "added" | "removed"
): EmojiCommunicationWithActionResponse {
    return {
        emoji: toEmojiCommunicationResponse(emoji),
        action
    };
}