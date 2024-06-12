const express = require('express')

const endpoints = module.exports = express.Router()

endpoints.use('/budget', require('./budget'))
