import { Request, Response } from 'express'
import { Master, User } from '../../modules/users/users.model'
import { Service } from '../../modules/service/service.model'
import {
	TimeItem,
	Booking,
	Work,
	Break,
} from '../../modules/time-item/time-item.model'

export default async function getDayInfo(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const userId = res.locals.user.userId
		const date = new Date(req.query.date as string)
		if (!date || isNaN(date.getTime())) {
			res.status(400).json({ error: 'Invalid date' })
			return
		}

		const startOfDay = new Date(date.setHours(0, 0, 0, 0))
		const endOfDay = new Date(date.setHours(23, 59, 59, 999))

		// 1. get all masters
		const masters = await Master.find()
			.select('-password -__v -createdAt -updatedAt')
			.exec()

		// 2. prepare response
		const result = await Promise.all(
			masters.map(async master => {
				const work = await Work.findOne({
					userId: master._id,
          date: { $gte: startOfDay, $lte: endOfDay }
				})
        if (!work) {
          return undefined
        }

				const breaks = await Break.find({
					userId: master._id,
					date: { $gte: startOfDay, $lte: endOfDay }
				})

				const bookings = await Booking.find({
					userId: master._id,
					date: { $gte: startOfDay, $lte: endOfDay }
				}).populate('clientId serviceId')

				return {
					...master.toObject(),
					work: work
						? { timeStart: work.timeStart, timeEnd: work.timeEnd }
						: null,
					breaks: breaks.map(b => b.toObject()),
					bookings: bookings.map(b => ({
						timeStart: b.timeStart,
						status: b.status,
						clientId: undefined,
						serviceId: undefined,
						client: b.clientId
							? { ...b.toObject().clientId, id: b.clientId._id, _id: undefined }
							: null,
						service: b.serviceId
							? {
									...b.toObject().serviceId,
									_id: undefined,
									id: b.serviceId._id,
							  }
							: null,
					})),
				}
			})
		)

		res.status(200).json({ masters: result })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Internal server error' })
	}
}
/* 
{
  masters: [
    {
      id: string,
      name: string,
      work: { start: Date, end: Date } | null,
      breaks: [ { start: Date, end: Date } ],
      bookings: [
        {
          start: Date,
          end: Date,
          discount: number,
          totalPrice: number,
          status: 'pending' | 'completed' | 'canceled',
          clientId: string,
          client: { id: string, name: string } | null,
          service: { id: string, name: string, price: number } | null
        }
      ]
    }
  ]
}






*/
