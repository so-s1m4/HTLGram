import {UserI, User, AdminI, Admin, MasterI, Master, Client, ClientI} from "./users.model"
import bcrypt from 'bcryptjs'
import {config} from '../../config/config'
import {ErrorWithStatus} from '../../common/middlewares/errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import mongoose, { HydratedDocument, Types } from "mongoose"
import deleteFile from "../../common/utils/utils.deleteFile"
import { GetUsersListDto, LoginUserDto, RegisterUserDto, UpdateMyDataDto, UpdateUserDto } from "./users.dto"

type UserDoc = HydratedDocument<UserI>;

const usersService = {
	async getMyData(userId: Types.ObjectId): Promise<UserDoc> {
	    const user = await User.findOneOrError({ _id: userId });
	    return user;
	},
	async getUsersList(data: GetUsersListDto, userId: Types.ObjectId): Promise<UserDoc[]> {
	    return await User.find({
				_id: { $ne: userId },
				role: data.role || { $in: ['admin', 'master', 'client'] },
			})
	},
	async register(data: RegisterUserDto): Promise<string> {
		let oldUser
		if (data.role !== 'client') {
			oldUser = await User.findOne({ username: data.username }).exec()
		} else {
			oldUser = await Client.findOne({ phone: data.phone }).exec()
		}
		if (oldUser)
			throw new ErrorWithStatus(
				400,
				'Уже существует пользователь с таким ' +
					(data.role === 'client' ? 'телефоном' : 'именем пользователя')
			)

		let user
		switch (data.role) {
			case 'admin':
				data.password = await bcrypt.hash(data.password!, config.PASSWORD_SALT)
				user = await Admin.create(data)
				break
			case 'master':
				data.password = await bcrypt.hash(data.password!, config.PASSWORD_SALT)
				user = await Master.create(data)
				break
			case 'client':
				user = await Client.create(data)
				break
		}
		return jwt.sign({ userId: user._id }, config.JWT_SECRET, {
			expiresIn: '7d',
		})
	},
	async login(data: LoginUserDto): Promise<string> {
	    const user = await User.findOne({ username: data.username }).select('+password').exec();
	    if (!user) throw new ErrorWithStatus(400, "User was not found");
        if (user.role === 'client') throw new ErrorWithStatus(400, "Client role cannot login with username and password");
        // @ts-ignore
        if (!await bcrypt.compare(data.password, user.password)) throw new ErrorWithStatus(400, "Password is false");
	    return jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
	},
	async updateMyData(userId: Types.ObjectId, data: UpdateMyDataDto): Promise<UserDoc> {
	    const user: any = await User.findOneOrError({ _id: userId });
	    if (data.password)
				{
					data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT);
					user.password = data.password;
				}
	    if (data.phone) user.phone = data.phone;
			if (data.email) user.email = data.email;

	    await user.save();
	    return user;
	},
	async deleteUser(userId: Types.ObjectId): Promise<void> {
	    const user = await User.findOneOrError({ _id: userId });
	    if (user.role === 'admin' || user.role === 'master') {
				throw new ErrorWithStatus(501, "Not implemented for admin and master roles");
			}
	    await user.deleteOne();
	},
	async updateUser(userId: Types.ObjectId, data: UpdateUserDto): Promise<void> {
	    const user:any = await User.findOneOrError({ _id: userId });

	    if (data.password) {
	        data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT);
	        user.password = data.password;
	    }
	    if (data.phone) user.phone = data.phone;
	    if (data.email) user.email = data.email;
	    if (data.name) user.name = data.name;
			
	    await user.save();
	}
	

	// async getFriends(userId: Types.ObjectId): Promise<Array<Pick<UserI, '_id' | 'img' | 'username' | 'name' | 'wasOnline' > & { isOnline?: boolean }>> {
	//     const pairs = await friendModel.find({ $or: [{ user1_id: userId }, { user2_id: userId }] }).lean();
	//     const friendIds = pairs.map(p =>
	//         p.user1_id.equals(userId) ? p.user2_id : p.user1_id
	//     );

	//     const friends = await UserModel.find({ _id: { $in: friendIds } }).select("img username name _id wasOnline").lean();
	//     return friends;
	// },

	// async deleteFriend(userId: Types.ObjectId, data: DeleteFriend): Promise<void> {
	//     const user1 = await UserModel.findOneOrError({ _id: userId });
	//     const user2 = await UserModel.findOneOrError({ _id: data.friendId });

	//     const del = await friendModel.deleteOne({
	//         $or: [{ user1_id: user1._id, user2_id: user2._id }, { user2_id: user1._id, user1_id: user2._id }]
	//     });

	//     if (del.deletedCount === 0) throw new ErrorWithStatus(404, "Friendship not found");

	//     user1.friendsCount -= 1;
	//     await user1.save();
	//     user2.friendsCount -= 1;
	//     await user2.save();
	// },

	// async uploadMyPhoto(userId: Types.ObjectId, avatar: Express.Multer.File): Promise<UserDoc> {
	//     const user = await UserModel.findOneOrError({ _id: userId });
	//     user.img.push({ path: avatar.filename, size: avatar.size });
	//     await user.save();
	//     return user;
	// },

	// async deleteMyPhoto(userId: Types.ObjectId, photoPath: string): Promise<UserDoc> {
	//     const user = await UserModel.findOneOrError({ _id: userId });
	//     const idx = user.img.findIndex((p) => p.path === photoPath);
	//     if (idx === undefined || idx < 0) throw new ErrorWithStatus(404, 'Photo not found');
	//     user.img.splice(idx, 1);
	//     deleteFile(photoPath);
	//     await user.save();
	//     return user;
	// },

	// async getUserData(data: GetUserDataDto): Promise<UserDoc> {
	//     const user = await UserModel.findOneOrError({ _id: data.userId });
	//     return user;
	// },
}

export default usersService;