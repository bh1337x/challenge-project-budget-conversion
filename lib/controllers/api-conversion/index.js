const express = require('express')
const mw = require('../../mw')
const services = require('./services')

const endpoints = module.exports = express.Router()

endpoints.post('/', mw.asyncHandler(async (req, res) => {
  const projectNames = req.body.projectNames
  if (!projectNames ||
      !Array.isArray(projectNames) ||
      projectNames.length === 0) {
    return res.status(400).send({
      success: false,
      error: 'Invalid project names'
    })
  }

  try {
    const projectBudgets = await services.findProjectBudgetsByNames(projectNames)
    const exchangeRates = await services.findExchangeRateOfTTD()

    const usdExchangeRate = exchangeRates.USD

    const projectBudgetsMap = projectBudgets.reduce((acc, project) => {
      const localCurrencyRate = exchangeRates[project.currency]
      acc[project.projectName] = {
        projectId: project.projectId,
        currency: project.currency,
        ttdToLocalRate: localCurrencyRate,
        ttdToUsdRate: usdExchangeRate,
        initialBudgetLocal: project.initialBudgetLocal,
        initialBudgetTtd:
          +(project.initialBudgetLocal / localCurrencyRate).toFixed(2),
        budgetUsd: project.budgetUsd,
        budgetTtd: +(project.budgetUsd / usdExchangeRate).toFixed(2),
        finalBudgetUsd: project.finalBudgetUsd,
        finalBudgetTtd: +(project.finalBudgetUsd / usdExchangeRate).toFixed(2)
      }
      return acc
    }, {})

    res.send({
      success: true,
      data: projectBudgetsMap
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    })
  }
}))
