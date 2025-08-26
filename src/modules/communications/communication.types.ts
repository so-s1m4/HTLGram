import { HydratedDocument, Model, Schema } from "mongoose"

export enum PayloadTypesEnum {
    PHOTOS  = "photo",
    VIDEOS  = "video",
    FILE = "file",
    AUDIO = "audio",
    VIDEOMESSAGE = "video_message",
    STICKER = "sticker",
}

export interface PayloadI extends Document {
    spaceId: Schema.Types.ObjectId,
    communicationId: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    type: PayloadTypesEnum,
    mime: string,
    size: number,
    path: string,
    createdAt: string
}


export interface CommunicationI extends Document {
    _id: Schema.Types.ObjectId,
    senderId: Schema.Types.ObjectId,
    spaceId: Schema.Types.ObjectId,
    text?: string,
    isConfirmed:  boolean,
    expiresAt: Date,
    editedAt: Date, 
    createdAt: Date,
    updatedAt: Date,
    repliedOn?: Schema.Types.ObjectId | null,
    seq: number
}

export interface CommunicationModelI extends Model<CommunicationI> {
  findOneOrError(filter: object): Promise<HydratedDocument<CommunicationI>>;
}