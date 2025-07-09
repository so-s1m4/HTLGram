import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose, { model, Model, Schema, Types, Document, HydratedDocument } from "mongoose";

export type FriendRequestStatus = "sent" | "accepted" | "canceled"

export interface FriendRequestI {
    _id: Types.ObjectId,
    sender_id: Types.ObjectId,
    sender_username: string,
    receiver_id: Types.ObjectId,
    receiver_username: string,
    status: FriendRequestStatus,
    text: string,
    createdAt: Date,
    updatedAt: Date
}

export interface FriendRequestModel extends Model<FriendRequestI> {
  findOneOrError(filter: object): Promise<HydratedDocument<FriendRequestI>>;
}

const friendRequestSchema = new Schema<FriendRequestI, FriendRequestModel>({
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: 1
    },
    sender_username: {
        type: String,
        required: true
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: 1
    },
    receiver_username: {
        type: String,
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
    statics: {
      async findOneOrError(filter: object) {
        const request = await this.findOne(filter).exec()
        if (!request) throw new ErrorWithStatus(404, "Friend request was not found")
        return request
      }
    },
    timestamps: true
})


export const friendRequestModel = model<FriendRequestI, FriendRequestModel>("FriendRequest", friendRequestSchema);


export interface FriendI {
  user1_id: Schema.Types.ObjectId,
  user2_id: Schema.Types.ObjectId
}

const friendSchema = new Schema<FriendI>(
  {
    user1_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: 1
    },
    user2_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: 1
    }
  }
) 

friendSchema.index(
  { user1_id: 1, user2_id: 1 },
  { unique: true }
);

export const friendModel = model<FriendI>("Friend", friendSchema)