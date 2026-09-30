const express = require('express')
const applicationsRoutes = require('./routes/applications.routes')

const app = express()

app.use(express.json())

app.use('/applications', applicationsRoutes)

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  })
})

module.exports = app