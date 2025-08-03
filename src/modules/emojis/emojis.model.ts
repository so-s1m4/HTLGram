import { model, Schema, Types } from "mongoose";
import { EmojiCommunicationI, EmojiI } from "./emojis.types";

const EmojiSchema = new Schema<EmojiI>({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
});

const EmojiCommunicationSchema = new Schema<EmojiCommunicationI>(
  {
    emojiId: {
      type: Types.ObjectId,
      ref: "Emoji",
      required: true,
    },
    communicationId: {
      type: Types.ObjectId,
      ref: "Communication",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const EmojiModel = model<EmojiI>("Emoji", EmojiSchema);
export const EmojiCommunicationModel = model<EmojiCommunicationI>(
  "EmojiCommunication",
  EmojiCommunicationSchema
);
