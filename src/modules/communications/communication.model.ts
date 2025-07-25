import { model, Schema, Types } from "mongoose";
import { CommunicationI, PayloadTypesEnum, PayloadI, CommunicationModelI } from "./communication.types";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";


const PayloadSchema = new Schema<PayloadI>(
  {
    communicationId: {
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
    mime:   { type: String, required: true }, 
    size:   { type: Number, required: true },
    path:   { type: String, required: true }, 
  },
  { timestamps: true }
);


const CommunicationSchema = new Schema<CommunicationI, CommunicationModelI>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    spaceId: {
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
    expiresAt: { type: Date },
    editedAt:  { type: Date },
  },
  {
    timestamps: true,
    statics: {
        async findOneOrError(filter: object) {
            const CommunicationModel = await this.findOne(filter).exec();
            
            if (!CommunicationModel) throw new ErrorWithStatus(404, 'Was not found');
            return CommunicationModel;
        }
    },
  }
);

export const PayloadModel = model<PayloadI>('Payload', PayloadSchema);
export const CommunicationModel = model<CommunicationI, CommunicationModelI>('Communication', CommunicationSchema);
