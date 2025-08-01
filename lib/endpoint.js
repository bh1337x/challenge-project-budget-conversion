const express = require('express')
const { asyncHandler } = require('./mw')

const endpoints = express.Router()
const projectBudget = require('./controllers/project/budget')

endpoints.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})
endpoints.post('/project/budget/currency', asyncHandler(
  projectBudget.convertCurrency
))
endpoints.get('/project/budget/:id', asyncHandler(projectBudget.getById))
endpoints.post('/project/budget', asyncHandler(projectBudget.create))
endpoints.put('/project/budget/:id', asyncHandler(projectBudget.updateById))
endpoints.delete('/project/budget/:id', asyncHandler(projectBudget.deleteById))

module.exports = endpoints
