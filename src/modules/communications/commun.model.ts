import { model, Schema, Types } from "mongoose";
import { CommunicationI, TextPayloadI, PayloadTypesEnum, PayloadI, FilePayloadI } from "./commun.types";


const PayloadSchema = new Schema<PayloadI>(
    {
        type: {
            type: String,
            enum: Object.values(PayloadTypesEnum),
            required: true
        }
    },
    {
        _id: false,
        discriminatorKey: "schemaType"
    }
)

const CommunicationSchema = new Schema<CommunicationI>(
    {   
        sender_id: {
            type: Types.ObjectId,
            required: true,
            ref: 'User'
        },
        space_id: {
            type: Types.ObjectId,
            required: true,
            ref: 'Space',
            index: 1
        },
        payloads: {
            type: [PayloadSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
)

CommunicationSchema.path<Schema.Types.Subdocument>('payloads').discriminator("TextPayload", 
    new Schema<TextPayloadI>({
        text: {
            type: String,
            maxlength: 10000,
            required: true
        }
    },
    {
        _id: false
    })
)

CommunicationSchema.path<Schema.Types.Subdocument>('payloads').discriminator("FilePayload", 
    new Schema<FilePayloadI>({
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    })
)


export const CommunicationModel = model<CommunicationI>('Communication', CommunicationSchema)