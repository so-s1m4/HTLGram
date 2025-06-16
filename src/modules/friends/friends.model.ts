import mongoose, { model, Model, Schema, Types, Document } from "mongoose";

export type FriendRequestStatus = "sent" | "accepted" | "canceled"

export interface FriendRequestI extends Document {
    _id: Types.ObjectId,
    sender: Types.ObjectId,
    receiver: Types.ObjectId,
    status: FriendRequestStatus,
    text: string,
    createdAt: Date,
    updatedAt: Date
}

const friendRequestSchema = new Schema<FriendRequestI>({
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["sent", "accepted", "canceled"],
      default: "sent",
      required: true
    },
    text: {
        type: String,
        default: "",
        required: true
    }
}, {
    timestamps: true
})


export const friendRequestModel: Model<FriendRequestI> = model<FriendRequestI>("FriendRequest", friendRequestSchema);