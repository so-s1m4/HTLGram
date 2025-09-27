import e from 'express'
import { Booking, Break, TimeItem, Work } from './time-item.model'

const timeItemToNormalView = (item: any) => ({
	id: item._id,
	...item.toObject(),
	_id: undefined,
	userId: undefined,
	clientId: undefined,
	serviceId: undefined,
	user: {
		// @ts-ignore
		...item.userId.toObject(),
		id: item.userId._id,
		_id: undefined,
	},
	client: item.clientId && {
		name: item.clientId?.name,
		id: item.clientId?._id,
		_id: undefined,
		phone: item.clientId?.phone,
		email: item.clientId?.email,
	},
	service: item.serviceId
		? {
				name: item.serviceId?.name,
				id: item.serviceId?._id,
				_id: undefined,
				price: item.serviceId?.price,
				duration: item.serviceId?.duration,
		  }
		: undefined,
})

const timeItemService = {
	async createTimeItem(userId: string, dto: any) {
		switch (dto.type) {
			case 'work':
				let work = await Work.create({ ...dto })
				let populatedWork = await Work.findOne({ _id: work._id })
					.populate('userId', '-password -__v -createdAt -updatedAt')
					.select('-__v')
					.exec()
				return timeItemToNormalView(populatedWork)
			case 'break':
				let breakItem = await Break.create({ ...dto })
				let populatedBreak = await Break.findOne({ _id: breakItem._id })
					.populate('userId', '-password -__v -createdAt -updatedAt')
					.select('-__v')
					.exec()
				return timeItemToNormalView(populatedBreak)
			case 'booking':
        let booking = await Booking.create({ ...dto })
        let populatedBooking = await Booking.findOne({ _id: booking._id })
          .populate('userId', '-password -__v -createdAt -updatedAt')
          .populate('serviceId')
          .populate('clientId')
          .select('-__v')
          .exec()
        return timeItemToNormalView(populatedBooking)
			default:
				throw new Error('Invalid time item type')
		}
	},
	async getTimeItems(data: any) {
		// dateFrom?: Date | undefined;
    // dateTo?: Date | undefined;
    // userId?: string | undefined;
    // clientId?: string | undefined;
    // serviceId?: string | undefined;
    // type?: TimeItemType | undefined;

		const [dataFrom, dataTo] = [data.dateFrom, data.dateTo].map((d: any) =>
			d ? new Date(d) : null
		)
		if (dataFrom || dataTo) {
			data.date = {}
			if (dataFrom) data.date.$gte = dataFrom
			if (dataTo) data.date.$lte = dataTo
			delete data.dateFrom
			delete data.dateTo
		}
		
		return (
			await TimeItem.find(data)
				.populate('userId', '-password -__v -createdAt -updatedAt')
				.populate('serviceId')
				.populate('clientId')
				.select('-__v')
				.exec()
		).map(timeItemToNormalView)
	},
	async getMyTimeItems(userId: string, data: any) {
		return (
			await TimeItem.find({ userId, ...data })
				.populate('userId', '-password -__v -createdAt -updatedAt')
				.populate('serviceId')
				.populate('clientId')
				.select('-__v')
				.exec()
		).map(timeItemToNormalView)
	},
	async getTimeItemById(timeItemId: string) {
		const item = await TimeItem.findById(timeItemId)
			.populate('userId', '-password -__v -createdAt -updatedAt')
			.populate('serviceId')
			.populate('clientId')
			.select('-__v')
			.exec()
		if (!item) throw new Error('Time item not found')
		return timeItemToNormalView(item)
	},
	async updateTimeItem(timeItemId: string, dto: any) {
		const item: any = await TimeItem.findOne({ _id: timeItemId }).exec()
		if (!item)
			throw new Error(
				'Time item not found or you do not have permission to update it'
			)
		if (item.type != 'booking') {
			Object.assign(item, dto)
			await item.save()
      return item
		}

		item.status = 'canceled'
		await item.save()

		const newBooking = await Booking.create({
			...item.toObject(),
			_id: undefined,
			status: 'pending',
		})

		let newBook = await Booking.findOne({ _id: newBooking._id })
			.populate('userId', '-password -__v -createdAt -updatedAt')
			.populate('serviceId')
			.populate('clientId')
			.select('-__v')
			.exec()
		if (!newBook) throw new Error('Time item not found after creation')

		return timeItemToNormalView(newBook)
	},
	async deleteTimeItem(timeItemId: string) {
		await TimeItem.findOneAndDelete({ _id: timeItemId }).exec()
	},
}

export default timeItemService
