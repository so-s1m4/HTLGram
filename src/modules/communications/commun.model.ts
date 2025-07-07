import { model, Schema } from "mongoose";
import { CommunicationI, TextPayloadI, ViewsI, PayloadTypesEnum } from "./commun.types";


const PayloadSchema = new Schema(
    {},
    {
        _id: false,
        discriminatorKey: "payload"
    }
)

export const TextPayloadSchema = PayloadSchema.discriminator("TextPayload", 
    new Schema<TextPayloadI>({
        text: {
            type: String,
            maxlength: 10000,
            required: true
        }
    },
    {
        _id: false,
        discriminatorKey: "payload"
    })
)

const  ViewsSchema = new Schema<ViewsI>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        _id: false
    }
)

const CommunicationSchema = new Schema<CommunicationI>(
    {   
        sender_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        payload_type: {
            type: String,
            enum: Object.values(PayloadTypesEnum),
            required: true
        },
        payload: {
            type: PayloadSchema
        },
        views: {
            type:  [ViewsSchema],
            default: []
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: "Communication"
        }]
    },
    {
        timestamps: true
    }
)

export const CommunicationModel = model<CommunicationI>('Communication', CommunicationSchema)
