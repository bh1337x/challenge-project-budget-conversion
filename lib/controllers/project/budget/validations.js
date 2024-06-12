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
      message: 'Year must be between 1900 and the current year'
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

module.exports = { currencyRules }
