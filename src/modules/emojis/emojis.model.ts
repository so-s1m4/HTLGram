import { model, Schema } from "mongoose";
import { EmojiI } from "./emojis.types";

const EmojiSchema = new Schema<EmojiI>({
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true }
})

export const EmojiModel = model<EmojiI>("Emoji", EmojiSchema);