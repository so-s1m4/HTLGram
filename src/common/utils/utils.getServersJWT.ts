import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../../jwtRS256.key'));

export default function getServerJWT() {
    try {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: 'main-server',
            aud: 'media-server',
            iat: now,
            exp: now + 10 * 60, // 10 min
        };

        const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
        return token
    } catch(e: any) {
        throw new ErrorWithStatus(500, "Internal Server Error");
    }
} 