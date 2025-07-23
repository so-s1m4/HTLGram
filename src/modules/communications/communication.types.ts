import { Schema } from "mongoose"

export enum PayloadTypesEnum {
    PHOTOS  = "photo",
    VIDEOS  = "video",
    FILE = "file"
}

export interface PayloadI extends Document {
    communication_id: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    type: PayloadTypesEnum,
    mine: string,
    size: number,
    path: string
}


export interface CommunicationI extends Document {
    sender_id: Schema.Types.ObjectId,
    space_id: Schema.Types.ObjectId,
    text?: string,
    isConfirmed:  boolean,
    expiresAt: Date,
    editedAt: Date, 
    createdAt: Date,
    updatedAt: Date
}

