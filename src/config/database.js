const { Pool } = require('pg')
const env = require('./env')

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD
})

const testConnection = async () => {
  const client = await pool.connect()

  try {
    await client.query('SELECT 1')
    console.log('Conexion a PostgreSQL exitosa')
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  testConnection
}