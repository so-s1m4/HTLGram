import mongoose, {
	Model,
	Schema,
	HydratedDocument,
	FilterQuery,
} from 'mongoose'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'

const options = { discriminatorKey: 'role', collection: 'users' }

export interface UserI {
	name: string
	role: 'admin' | 'master' | 'client';
	createdAt?: Date
	updatedAt?: Date
}

export interface UserModel extends Model<UserI> {
	findOneOrError(filter: FilterQuery<UserI>): Promise<HydratedDocument<UserI>>
}

const userSchema = new Schema<UserI, UserModel>(
	{
		name: { type: String, required: true },
		role: { type: String, enum: ['admin', 'master', 'client'], required: true, immutable: true }
	},
	{
		...options,
		timestamps: true,
	}
)

userSchema.statics.findOneOrError = async function (
	this: UserModel,
	filter: FilterQuery<UserI>
) {
	const user = await this.findOne(filter).exec()
	if (!user) throw new ErrorWithStatus(404, 'User was not found')
	return user
}

export const User = mongoose.model<UserI, UserModel>('User', userSchema)

// ---------- Discriminators ----------

export interface AdminI extends UserI {
	username: string
	password: string
	role: 'admin'
}

const adminSchema = new Schema<AdminI>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
})
export const Admin = User.discriminator<AdminI>('admin', adminSchema)

export interface MasterI extends UserI {
	username: string
	password: string
	role: 'master'
}
const masterSchema = new Schema<MasterI>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
})
export const Master = User.discriminator<MasterI>('master', masterSchema)

export interface ClientI extends UserI {
	password?: string
	phone?: string
	email?: string
	role: 'client'
}
const clientSchema = new Schema<ClientI>({
	password: { type: String },
	phone: { type: String, unique: true, sparse: true },
	email: { type: String, unique: true, sparse: true },
})
export const Client = User.discriminator<ClientI>('client', clientSchema)
