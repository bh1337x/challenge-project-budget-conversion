const currencyRules = {
  year: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Year is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Year must be a number'
    },
    {
      fn: value => value >= 1990 && value <= new Date().getFullYear(),
      message: 'Year must be between 1990 and the current year'
    }
  ],
  projectName: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Project name is required'
    },
    {
      fn: value => typeof value === 'string',
      message: 'Project name must be a string'
    }
  ],
  currency: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Currency is required'
    },
    {
      fn: value => typeof value === 'string',
      message: 'Currency must be a string'
    },
    {
      fn: value => value.length === 3 &&
        value.split('').every(char => char === char.toUpperCase()),
      message: 'Currency must adhere to ISO 4217 standards'
    }
  ]
}

const addProjectBudgetRule = {
  projectId: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Project ID is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Project ID must be a number'
    }
  ],
  projectName: currencyRules.projectName,
  year: currencyRules.year,
  currency: currencyRules.currency,
  initialBudgetLocal: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Initial budget local is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Initial budget local must be a number'
    }
  ],
  budgetUsd: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Budget USD is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Budget USD must be a number'
    }
  ],
  initialScheduleEstimateMonths: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Initial schedule estimate months is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Initial schedule estimate months must be a number'
    }
  ],
  adjustedScheduleEstimateMonths: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Adjusted schedule estimate months is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Adjusted schedule estimate months must be a number'
    }
  ],
  contingencyRate: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Contingency rate is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Contingency rate must be a number'
    }
  ],
  escalationRate: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Escalation rate is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Escalation rate must be a number'
    }
  ],
  finalBudgetUsd: [
    {
      fn: value => typeof value !== 'undefined',
      message: 'Final budget USD is required'
    },
    {
      fn: value => typeof value === 'number',
      message: 'Final budget USD must be a number'
    }
  ]
}

module.exports = { currencyRules, addProjectBudgetRule }
