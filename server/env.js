require('dotenv').config();

const env = {
    PORT: Number(process.env.PORT),
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
}

module.exports = env