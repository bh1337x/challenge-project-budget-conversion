const budgetService = require('../services/budget')
const currencyService = require('../services/currency')
const validateObject = require('../validator')

module.exports = async function apiConversion (req, res) {
  const { isValid, errors } = validateObject(req.body, conversionRules)
  if (!isValid) return res.status(400).json({ success: false, error: errors })

  const { projectNames } = req.body
  try {
    const projectBudgets = await budgetService.findByNames(projectNames)
    const exchangeRates = await currencyService.getRate('TTD')

    const usdExchangeRate = exchangeRates.USD
    if (!usdExchangeRate) {
      return res.status(500).send({
        success: false,
        error: 'Failed to fetch USD exchange rate'
      })
    }

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

    res.send({ success: true, data: projectBudgetsMap })
  } catch (error) {
    res.status(500).send({ success: false, error: error.message })
  }
}

const conversionRules = {
  projectNames: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Project names are required'
    },
    {
      test: value => Array.isArray(value),
      message: 'Project names must be an array'
    },
    {
      test: value => value.length > 0,
      message: 'Project names must not be empty'
    }
  ]
}
