import { Schema } from "mongoose";

export interface EmojiI {
    _id: Schema.Types.ObjectId;
    name: string;
    url: string;
}

export interface EmojiCommunicationI {
    _id: Schema.Types.ObjectId;
    emojiId: Schema.Types.ObjectId; 
    communicationId: Schema.Types.ObjectId; 
    userId: Schema.Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}