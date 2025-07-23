import { model, Schema, Types } from "mongoose";
import { CommunicationI, PayloadTypesEnum, PayloadI } from "./communication.types";


const PayloadSchema = new Schema<PayloadI>(
  {
    communication_id: {
      type: Schema.Types.ObjectId,
      ref: 'Communication',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PayloadTypesEnum),
      required: true,
      index: true,
    },
    mine:   { type: String, required: true }, 
    size:   { type: Number, required: true },
    path:   { type: String, required: true }, 
  },
  { timestamps: true }
);


const CommunicationSchema = new Schema<CommunicationI>(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    space_id: {
      type: Schema.Types.ObjectId,
      ref: 'Space',
      required: true,
      index: true,
    },
    text: {
      type: String,
      maxlength: 10000,
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: { type: Date, index: true },
    editedAt:  { type: Date },
  },
  {
    timestamps: true
  }
);

export const PayloadModel = model<PayloadI>('Payload', PayloadSchema);
export const CommunicationModel = model<CommunicationI>('Communication', CommunicationSchema);
