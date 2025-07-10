import { Schema } from "mongoose"

export enum PayloadTypesEnum {
    TEXT = "text",
    PHOTOS  = "photo",
    VIDEOS  = "video",
}

export interface PayloadI {
    type: PayloadTypesEnum
}

export interface TextPayloadI extends PayloadI {
    text: string
}

export interface FilePayloadI extends PayloadI {
    path: string,
    size: number
}

export interface CommunicationI {
    sender_id: Schema.Types.ObjectId,
    payloads: PayloadI[],
    space_id: Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

