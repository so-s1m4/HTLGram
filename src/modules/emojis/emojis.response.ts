
import { HydratedDocument } from "mongoose";
import { EmojiI } from "./emojis.types";

export type EmojiResponse = {
    id: string;
    name: string;
    url: string;
}

export function toEmojiResponse(emoji: HydratedDocument<EmojiI>): EmojiResponse {
    return {
        id: String(emoji._id),
        name: emoji.name,
        url: emoji.url
    };
}

export function toEmojiResponseArray(emojis: HydratedDocument<EmojiI>[]): EmojiResponse[] {
    return emojis.map(toEmojiResponse);
}