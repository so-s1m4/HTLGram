import mongoose, {
  Model,
  Schema,
  HydratedDocument,
  FilterQuery,
} from 'mongoose'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'

const options = { discriminatorKey: 'type', collection: 'time_items' }

export interface TimeItemI {
  type: 'work' | 'break' | 'booking';
  date: Date,
  userId: mongoose.Types.ObjectId,

  timeStart: number,

  createdAt?: Date
  updatedAt?: Date
}

export interface TimeItemModel extends Model<TimeItemI> {
  findOneOrError(filter: FilterQuery<TimeItemI>): Promise<HydratedDocument<TimeItemI>>
}

const timeItemSchema = new Schema<TimeItemI, TimeItemModel>(
  {
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    timeStart: { type: Number, required: true },
  },
  {
    ...options,
    timestamps: true,
  }
)
timeItemSchema.statics.findOneOrError = async function (
  this: TimeItemModel,
  filter: FilterQuery<TimeItemI>
) {
  const user = await this.findOne(filter).exec()
  if (!user) throw new ErrorWithStatus(404, 'User was not found')
  return user
}
export const TimeItem = mongoose.model<TimeItemI, TimeItemModel>('TimeItem', timeItemSchema)



// ---------- Discriminators ----------

export interface WorkI extends TimeItemI {
	type: 'work'
	timeEnd: number
}
const workSchema = new Schema<WorkI>({
  timeEnd: { type: Number, required: true },
})
export const Work = TimeItem.discriminator<WorkI>('work', workSchema)




export interface BreakI extends TimeItemI {
	type: 'break'
	timeEnd: { type: Number; required: true }
}
const breakSchema = new Schema<BreakI>({
  timeEnd: { type: Number, required: true },
})
export const Break = TimeItem.discriminator<BreakI>('break', breakSchema)




export interface BookingI extends TimeItemI {
  clientId: mongoose.Types.ObjectId,
  serviceId: mongoose.Types.ObjectId,
  type: 'booking',
  status: 'pending' | 'confirmed' | 'canceled',
}
const bookingSchema = new Schema<BookingI>({
  clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
})
export const Booking = TimeItem.discriminator<BookingI>('booking', bookingSchema)
