const express = require('express')

const endpoints = express.Router()

endpoints.use('/budget', require('./budget'))

module.exports = endpoints