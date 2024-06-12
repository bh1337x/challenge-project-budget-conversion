const db = require('../../../db')

module.exports = { findProjectBudgetsByNameAndYear, convertCurrency }

/**
 * Find a project by name and year
 * @param {string} name
 * @param {number} year
 * @returns {Promise<{
  * projectId: number,
  * projectName: string,
  * year: number,
  * currency: string,
  * initialBudgetLocal: number,
  * budgetUsd: number,
  * initialScheduleEstimateMonths: number,
  * adjustedScheduleEstimateMonths: number,
  * contingencyRate: number,
  * escalationRate: number,
  * finalBudgetUsd: number,
 * }[]>}
 */
async function findProjectBudgetsByNameAndYear (name, year) {
  return new Promise((resolve, reject) => {
    db.selectQuery(
      'SELECT * FROM project WHERE projectName = ? AND year = ?',
      [name, year],
      (err, data) => {
        if (err) return reject(new Error('Failed to find project'))
        resolve(data)
      })
  })
}

/**
 * Convert a currency amount
 * @param {string} fromCurrencyCode - ISO 4217 currency code to convert from
 * @param {string} toCurrencyCode - ISO 4217 currency code to convert to
 * @param {number} amount - Amount to convert
 * @returns {Promise<number>} - Converted amount
 */
async function convertCurrency (fromCurrencyCode, toCurrencyCode, amount) {
  const response = await fetch(
    `${EXCHANGE_API_URL}/${fromCurrencyCode}/${toCurrencyCode}/${amount}`
  )
  if (!response.ok) throw new Error('Failed to convert currency')

  const data = await response.json()
  if (data.result === 'error') {
    switch (data['error-type']) {
      case 'unsupported-code':
        throw new Error('Currency code not supported')
      default:
        throw new Error('Failed to convert currency')
    }
  }

  return data.conversion_result
}

const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/pair`
