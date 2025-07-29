import { UserModel } from "../users/users.model";
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

export interface FriendRequestModelI extends Model<FriendRequestI> {
  findOneOrError(filter: object): Promise<HydratedDocument<FriendRequestI>>;
}

const friendRequestSchema = new Schema<FriendRequestI, FriendRequestModelI>({
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


export const friendRequestModel = model<FriendRequestI, FriendRequestModelI>("FriendRequest", friendRequestSchema);


export interface FriendI {
  user1_id: Types.ObjectId,
  user2_id: Types.ObjectId
}

export interface FriendModelI extends Model<FriendI> {
  areFriends(user1_id: Types.ObjectId, user2_id: Types.ObjectId): Promise<boolean>;
}

const friendSchema = new Schema<FriendI, FriendModelI>(
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
  },
  {
    statics: {
      async areFriends(user1_id: Types.ObjectId, user2_id: Types.ObjectId): Promise<boolean> {
        const user1 = await UserModel.findOneOrError({_id: user1_id})
        const user2 = await UserModel.findOneOrError({_id: user2_id})
        const friendship = await friendModel.findOne({
            $or: [
                {user1_id, user2_id},
                {user1_id: user2_id, user2_id: user1_id}
            ]
        }).exec()
        return (friendship ? true : false)
      }
    }
  }
) 

friendSchema.pre('validate', function(next) {
  if (this.user1_id.toString() === this.user2_id.toString()) {
      return next(new Error("user1_id and user2_id must be different"));
  }

  if (this.user1_id.toString() > this.user2_id.toString()) {
      [this.user1_id, this.user2_id] = [this.user2_id, this.user1_id];
  }
  next();
})

friendSchema.index(
  { user1_id: 1, user2_id: 1 },
  { unique: true }
);

export const friendModel = model<FriendI, FriendModelI>("Friend", friendSchema)