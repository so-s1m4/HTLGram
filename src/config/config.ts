import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET_ADMIN: string
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN || "secret"
}