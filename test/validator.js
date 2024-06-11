process.env.NODE_ENV = 'test'

const test = require('tape')
const isObjectValid = require('../lib/validator')

test('isObjectValid should return true if the object is valid', function (t) {
  const { isValid, errors } = isObjectValid({
    year: 2024,
    projectName: 'Humitas Hewlett Packard',
    currency: 'TTD'
  }, rules)

  t.true(isValid, 'Should return true')
  t.equal(Object.keys(errors).length, 0, 'Should return no errors')
  t.end()
})

test('isObjectValid should return false if the object is invalid', function (t) {
  const { isValid, errors } = isObjectValid({
    projectName: 'Humitas Hewlett Packard',
    currency: 'ttd'
  }, rules)

  t.false(isValid, 'Should return false')
  t.equal(Object.keys(errors).length, 2, 'Should return two errors')
  t.equal(errors.year, 'Year is required', 'Should return an error for year')
  t.equal(errors.currency, 'Currency must adhere to ISO 4217', 'Should return an error for currency')
  t.end()
})

const rules = {
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
      fn: value => value >= 1900 && value <= new Date().getFullYear(),
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
      message: 'Currency must adhere to ISO 4217'
    }
  ]
}
