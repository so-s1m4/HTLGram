import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET_ADMIN: string,
    MONGO_URI: string
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN || "secret",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/htlgram"
}