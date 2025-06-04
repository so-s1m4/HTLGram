import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';
import {ObjectSchema} from 'joi'

function validationWrapper(schema: ObjectSchema, data: any) {
    const { error, value } = schema.validate(data);
    console.log(error)
    console.log("Validatin error")
    console.log(value)
    if (error) {
        throw new ErrorWithStatus(400, error.message)
    } else {
        return value
    }
}

export default validationWrapper