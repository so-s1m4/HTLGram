import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    MONGO_URI: string,
    PASSWORD_SALT: number,
    TIME_TO_DELETE_COMMUNICATION: number,
    MEDIA_SERVER: string,
    SEED_EMOJIS: boolean,
    PRIVATE_KEY_PATH: string,
    PRIVATE_KEY_BASE64: string
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET_ADMIN || "secret",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/htlgram",
    PASSWORD_SALT: Number(process.env.PASSWORD_SALT) || 10,
    TIME_TO_DELETE_COMMUNICATION: Number(process.env.TIME_TO_DELETE_COMMUNICATION) || 10,
    MEDIA_SERVER: process.env.MEDIA_SERVER || "http://localhost:8001",
    SEED_EMOJIS: process.env.SEED_EMOJIS === 'true' || false,
    PRIVATE_KEY_PATH: process.env.PRIVATE_KEY_PATH || 'jwtRS256.key',
    PRIVATE_KEY_BASE64: Buffer.from(process.env.PRIVATE_KEY_BASE64 || '', 'base64').toString('utf8')
    
}