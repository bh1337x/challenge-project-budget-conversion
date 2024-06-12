const express = require('express')

const endpoints = module.exports = express.Router()

endpoints.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})

endpoints.use('/project', require('./controllers/project'))
