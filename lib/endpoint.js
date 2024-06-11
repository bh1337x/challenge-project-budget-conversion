const express = require('express')

const endpoints = express.Router()

endpoints.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})

endpoints.use('/project', require('./controllers/project'))

module.exports = endpoints
