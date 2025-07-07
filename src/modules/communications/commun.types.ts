import { Schema } from "mongoose"

export enum PayloadTypesEnum {
    TEXT = "text",
    PHOTOS  = "photos",
    VIDEOS  = "videos",
}

export interface TextPayloadI {
    text: string
}

export interface PhotosPayloadI {
    paths: string[],
    size: number
}

export interface VideosPayloadI {
    paths: string[],
    size: number
}

export interface ViewsI {
    user_id: Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

export interface CommunicationI {
    sender_id: Schema.Types.ObjectId,
    payload_type: PayloadTypesEnum,
    payload: TextPayloadI | PhotosPayloadI | VideosPayloadI,
    createdAt: Date,
    updatedAt: Date,
    views: ViewsI[],
    comments: Schema.Types.ObjectId[]
}



// add reactions[]