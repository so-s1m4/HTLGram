import {UserI, UserModel} from "./users.model"
import bcrypt from 'bcryptjs'
import {config} from '../../config/config'
import {ErrorWithStatus} from '../../common/middlewares/errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { HydratedDocument, Types } from "mongoose"
import deleteFile from "../../common/utils/utils.deleteFile"
import { friendModel } from "../friends/friends.model"
import { PostsModel } from "../spaces/spaces.model"
import { DeleteFriend, GetUserDataDto, GetUsersListDto, LoginUserDto, RegisterUserDto, UpdateMyDataDto } from "./users.dto"

type UserDoc = HydratedDocument<UserI>;

const usersService = {
    async getUsersList(data: GetUsersListDto): Promise<UserDoc[]> {
        const start = data.startsWith.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return await UserModel.find({ username: new RegExp(`^${start}`, 'i') })
            .limit(data.limit)
            .skip(data.offSet)
    },

    async register(data: RegisterUserDto): Promise<string> {
        const oldUser = await UserModel.findOne({ username: data.username }).exec();
        if (oldUser) throw new ErrorWithStatus(400, "User with such username already exist");
        data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT);
        const user = await UserModel.create(data);
        await PostsModel.create({
            owner: user._id
        });
        return jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
    },

    async login(data: LoginUserDto): Promise<string> {
        const oldUser = await UserModel.findOne({ username: data.username }).select('+password').exec();
        if (!oldUser) throw new ErrorWithStatus(400, "User was not found");
        if (!await bcrypt.compare(data.password, oldUser.password)) throw new ErrorWithStatus(400, "Password is false");
        return jwt.sign({ userId: oldUser._id }, config.JWT_SECRET, { expiresIn: '7d' });
    },

    async getMyData(userId: Types.ObjectId): Promise<UserDoc> {
        const user = await UserModel.findOneOrError({ _id: userId });
        return user;
    },

    async updateMyData(userId: Types.ObjectId, data: UpdateMyDataDto): Promise<UserDoc> {
        const user = await UserModel.findOneOrError({ _id: userId });
        if (data.password) data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT);
        user.set(data);
        await user.save();
        return user;
    },

    async getFriends(userId: Types.ObjectId): Promise<Array<Pick<UserI, '_id' | 'img' | 'username' | 'name'>>> {
        const pairs = await friendModel.find({ $or: [{ user1_id: userId }, { user2_id: userId }] }).lean();
        const friendIds = pairs.map(p =>
            p.user1_id.equals(userId) ? p.user2_id : p.user1_id
        );

        const friends = await UserModel.find({ _id: { $in: friendIds } }).select("img username name _id").lean();
        return friends;
    },

    async deleteFriend(userId: Types.ObjectId, data: DeleteFriend): Promise<void> {
        const user1 = await UserModel.findOneOrError({ _id: userId });
        const user2 = await UserModel.findOneOrError({ _id: data.friendId });

        const del = await friendModel.deleteOne({
            $or: [{ user1_id: user1._id, user2_id: user2._id }, { user2_id: user1._id, user1_id: user2._id }]
        });
        
        if (del.deletedCount === 0) throw new ErrorWithStatus(404, "Friendship not found");

        user1.friendsCount -= 1;
        await user1.save();
        user2.friendsCount -= 1;
        await user2.save();
    },

    async uploadMyPhoto(userId: Types.ObjectId, avatar: Express.Multer.File): Promise<UserDoc> {
        const user = await UserModel.findOneOrError({ _id: userId });
        user.img.push({ path: avatar.filename, size: avatar.size });
        await user.save();
        return user;
    },

    async deleteMyPhoto(userId: Types.ObjectId, photoPath: string): Promise<UserDoc> {
        const user = await UserModel.findOneOrError({ _id: userId });
        const idx = user.img.findIndex((p) => p.path === photoPath);
        if (idx === undefined || idx < 0) throw new ErrorWithStatus(404, 'Photo not found');
        user.img.splice(idx, 1);
        deleteFile(photoPath);
        await user.save();
        return user;
    },

    async getUserData(data: GetUserDataDto): Promise<UserDoc> {
        const user = await UserModel.findOneOrError({ _id: data.userId });
        return user;
    },

};

export default usersService;