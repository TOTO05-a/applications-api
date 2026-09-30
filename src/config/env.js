const dotenv = require('dotenv')
const { z } = require('zod')

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string()
})

const env = envSchema.parse(process.env)

module.exports = env