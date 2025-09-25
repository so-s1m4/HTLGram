import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    MONGO_URI: string,
    PASSWORD_SALT: number,
    DOMEN: string
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET_ADMIN || "secret",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/htlgram",
    PASSWORD_SALT: Number(process.env.PASSWORD_SALT) || 10,
    DOMEN: process.env.DOMEN || "*"
}