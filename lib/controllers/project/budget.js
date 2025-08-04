const budgetService = require('../../services/budget')
const currencyService = require('../../services/currency')
const validateObject = require('../../validator')

module.exports = {
  convertCurrency,
  getById,
  create,
  updateById,
  deleteById
}

async function convertCurrency (req, res) {
  const { isValid, errors } = validateObject(req.body, currencyRules)
  if (!isValid) return res.status(400).json({ success: false, error: errors })

  const { year, projectName, currency } = req.body
  try {
    const projectBudgets = await budgetService.findByNameAndYear(
      projectName,
      year
    )

    const currencyParts = currency.toLowerCase().split('')
    currencyParts[0] = currencyParts[0].toUpperCase()
    const currencyPropertyName = `finalBudget${currencyParts.join('')}`
    for (const projectBudget of projectBudgets) {
      if (projectBudget.currency === currency) {
        projectBudget.finalBudgetUsd = projectBudget.budgetUsd
      } else {
        projectBudget[currencyPropertyName] = await currencyService.convert(
          'USD',
          currency,
          projectBudget.finalBudgetUsd
        )
      }
    }

    res.status(200).json({ success: true, data: projectBudgets })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}

async function getById (req, res, next) {
  const id = +req.params.id
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  try {
    const projectBudget = await budgetService.findById(id)
    if (!projectBudget) return next()

    res.status(200).json(projectBudget)
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}

async function create (req, res) {
  const id = +req.body.projectId
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  const { isValid, errors } = validateObject(req.body, createRules)
  if (!isValid) return res.status(400).json({ success: false, error: errors })

  try {
    const existingBudget = await budgetService.findById(id)
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: 'Project ID already exists'
      })
    }

    await budgetService.create(req.body)
    res.status(201).json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}

async function updateById (req, res, next) {
  const id = +req.params.id
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  const { isValid, errors } = validateObject(req.body, updateRules)
  if (!isValid) return res.status(400).json({ success: false, error: errors })

  try {
    const existingBudget = await budgetService.findById(id)
    if (!existingBudget) return next()

    await budgetService.updateById(id, req.body)
    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}

async function deleteById (req, res, next) {
  const id = +req.params.id
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  try {
    const existingBudget = await budgetService.findById(id)
    if (!existingBudget) return next()

    await budgetService.deleteById(id)
    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}

const currencyRules = {
  year: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Year is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Year must be a number'
    },
    {
      test: value => value >= 1990 && value <= new Date().getFullYear(),
      message: 'Year must be between 1990 and the current year'
    }
  ],
  projectName: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Project name is required'
    },
    {
      test: value => typeof value === 'string',
      message: 'Project name must be a string'
    }
  ],
  currency: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Currency is required'
    },
    {
      test: value => typeof value === 'string',
      message: 'Currency must be a string'
    },
    {
      test: value => value.length === 3 &&
        value.split('').every(char => char === char.toUpperCase()),
      message: 'Currency must adhere to ISO 4217 standards'
    }
  ]
}

const createRules = {
  projectId: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Project ID is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Project ID must be a number'
    }
  ],
  projectName: currencyRules.projectName,
  year: currencyRules.year,
  currency: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Currency is required'
    },
    {
      test: value => typeof value === 'string',
      message: 'Currency must be a string'
    },
    {
      test: value => value.length === 3 &&
        value.split('').every(char => char === char.toUpperCase()),
      message: 'Currency must adhere to ISO 4217 standards'
    }
  ],
  initialBudgetLocal: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Initial budget local is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Initial budget local must be a number'
    }
  ],
  budgetUsd: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Budget USD is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Budget USD must be a number'
    }
  ],
  initialScheduleEstimateMonths: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Initial schedule estimate months is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Initial schedule estimate months must be a number'
    }
  ],
  adjustedScheduleEstimateMonths: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Adjusted schedule estimate months is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Adjusted schedule estimate months must be a number'
    }
  ],
  contingencyRate: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Contingency rate is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Contingency rate must be a number'
    }
  ],
  escalationRate: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Escalation rate is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Escalation rate must be a number'
    }
  ],
  finalBudgetUsd: [
    {
      test: value => typeof value !== 'undefined',
      message: 'Final budget USD is required'
    },
    {
      test: value => typeof value === 'number',
      message: 'Final budget USD must be a number'
    }
  ]
}

const updateRules = {
  projectName: createRules.projectName,
  year: createRules.year,
  currency: createRules.currency,
  initialBudgetLocal: createRules.initialBudgetLocal,
  budgetUsd: createRules.budgetUsd,
  initialScheduleEstimateMonths:
    createRules.initialScheduleEstimateMonths,
  adjustedScheduleEstimateMonths:
    createRules.adjustedScheduleEstimateMonths,
  contingencyRate: createRules.contingencyRate,
  escalationRate: createRules.escalationRate,
  finalBudgetUsd: createRules.finalBudgetUsd
}
