import { HydratedDocument, MergeType, PopulatedDoc, Types } from "mongoose";
import { emojiGetListDto, emojiToggleDto } from "./emojis.dto";
import { EmojiCommunicationModel, EmojiModel } from "./emojis.model";
import { EmojiCommunicationI, EmojiI } from "./emojis.types";
import { CommunicationI } from "../../modules/communications/communication.types";
import { UserI } from "../../modules/users/users.model";
import { CommunicationModel } from "../../modules/communications/communication.model";
import { SpaceMemberModel } from "../../modules/spaces/spaces.model";

const emojisService = {
  async getList(data: emojiGetListDto) {
    const emojis = await EmojiModel.find({})
      .skip(data.offset)
      .limit(data.limit)
      .exec();
    return emojis;
  },

  async toggle(
    data: emojiToggleDto,
    userId: Types.ObjectId
  ): Promise<{
    emoji: MergeType<EmojiCommunicationI, {emojiId: EmojiI, communicationId: CommunicationI, userId: UserI}>;
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
        emoji: populated,
        action: "removed",
      };
    } else {
      const emojiExists = await EmojiModel.findById(data.emojiId);
      if (!emojiExists) {
        throw new Error("Emoji not found");
      }
      const communicationExists = await CommunicationModel.findOneOrError({_id: data.communicationId});
      const member = await SpaceMemberModel.findOneOrError({
        spaceId: communicationExists.spaceId,
        userId,
      })
      
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
        emoji: populated,
        action: "added",
      };
    }
  },
};

export default emojisService;
