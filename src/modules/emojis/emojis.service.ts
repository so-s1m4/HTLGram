import { HydratedDocument, MergeType, PopulatedDoc, Types } from "mongoose";
import { emojiGetListDto, emojiToggleDto } from "./emojis.dto";
import { EmojiCommunicationModel, EmojiModel } from "./emojis.model";
import { EmojiCommunicationI, EmojiI } from "./emojis.types";
import { CommunicationI } from "../../modules/communications/communication.types";
import { UserI } from "../../modules/users/users.model";
import { CommunicationModel } from "../../modules/communications/communication.model";
import { SpaceMemberModel, SpaceModel } from "../../modules/spaces/spaces.model";
import { SpaceTypesEnum } from "modules/spaces/spaces.types";
import { UserShortPublicResponse } from "modules/users/users.responses";

export type EmojiResponse = {
    emojiUniqueId: string;
    emojiName: string;
    emojiUrl: string;
}


export type EmojiCommunicationResponse = {
    emoji: EmojiResponse;
    communicationId: string;
    spaceId: string;
    user: UserShortPublicResponse;
    createdAt: Date;
    updatedAt: Date;
}

export type EmojiCommunicationWithoutSpaceResponse = {
    emoji: EmojiResponse;
    communicationId: string;
    user: UserShortPublicResponse;
    createdAt: Date;
    updatedAt: Date;
}

const emojisService = {
  async getList(data: emojiGetListDto): Promise<EmojiResponse[]> {
    const emojis = await EmojiModel.find({})
      .skip(data.offset)
      .limit(data.limit)
      .exec();
    return emojis.map(emoji => ({
        emojiUniqueId: String(emoji._id),
        emojiName: emoji.name,
        emojiUrl: emoji.url
      }));
  },

  async toggle(
    data: emojiToggleDto,
    userId: Types.ObjectId
  ): Promise<{
    emoji: EmojiCommunicationResponse;
    action: "removed" | "added";
  }> {
    const emoji = await EmojiCommunicationModel.findOne({
      emojiId: data.emojiId,
      userId,
      communicationId: data.communicationId,
    });
    if (emoji) {
      const populated = await emoji.populate<{emojiId: HydratedDocument<EmojiI>, communicationId: HydratedDocument<CommunicationI>, userId: HydratedDocument<UserI>}>("emojiId communicationId userId");
      await EmojiCommunicationModel.deleteOne({ _id: emoji._id });
      return {
        emoji: {
          emoji: {
            emojiUniqueId: String(populated.emojiId._id),
            emojiName: populated.emojiId.name,
            emojiUrl: populated.emojiId.url,
          },
          communicationId: String(populated.communicationId._id),
          spaceId: String(populated.communicationId.spaceId),
          user: {
            id: populated.userId._id.toString(),
            username: populated.userId.username,
            img: populated.userId.img
          },
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        },
        action: "removed",
      };
    } else {
      const emojiExists = await EmojiModel.findById(data.emojiId);
      if (!emojiExists) {
        throw new Error("Emoji not found");
      }
      const communicationExists = await CommunicationModel.findOneOrError({_id: data.communicationId});
      
      const space = await SpaceModel.findById(communicationExists.spaceId);
      if (!space) throw new Error("Space not found");
      const member = await SpaceMemberModel.findOne({
        spaceId: communicationExists.spaceId,
        userId,
      })
      if (space.type !== SpaceTypesEnum.POSTS && (!member || (member.isBaned || member.isMuted))) throw new Error("You are banned or muted in this space");

      const userEmojis = await EmojiCommunicationModel.find({
        userId,
        communicationId: data.communicationId,
      })
      if (userEmojis.length >= 3) {
        throw new Error("You can only use 3 emojis per communication");
      }

      const newEmoji = await EmojiCommunicationModel.create({
        emojiId: data.emojiId,
        userId,
        communicationId: data.communicationId,
      });
      const populated = await newEmoji.populate<{emojiId: HydratedDocument<EmojiI>, communicationId: HydratedDocument<CommunicationI>, userId: HydratedDocument<UserI>}>("emojiId communicationId userId");
      return {
        emoji: {
          emoji: {
            emojiUniqueId: String(populated.emojiId._id),
            emojiName: populated.emojiId.name,
            emojiUrl: populated.emojiId.url,
          },
          communicationId: String(populated.communicationId._id),
          spaceId: String(populated.communicationId.spaceId),
          user: {
            id: populated.userId._id.toString(),
            username: populated.userId.username,
            img: populated.userId.img
          },
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        },
        action: "added",
      };
    }
  },
};

export default emojisService;
