const db = require('../../db')

module.exports = {
  findProjectBudgetsByNames,
  findExchangeRateOfTTD
}

/**
 * Find project budgets by name
 * @param {string[]} projectNames - The project names
 * @returns {Promise<import('../project/budget/services').ProjectBudget[]>}
 * - The promise that resolves with the project budgets
 */
async function findProjectBudgetsByNames (projectNames) {
  return new Promise((resolve, reject) => {
    db.selectQuery(
      `SELECT * FROM project WHERE projectName IN (${
        projectNames.map(_ => '?').join(',')
      })`,
      projectNames,
      (err, data) => {
        if (err) return reject(new Error('Failed to find projects'))
        resolve(data)
      }
    )
  })
}

async function findExchangeRateOfTTD () {
  const response = await fetch(
    `${EXCHANGE_API_URL}/latest/TTD`
  )
  if (!response.ok) throw new Error('Failed to fetch exchange rates')

  const data = await response.json()
  if (data.result === 'error') throw new Error('Failed to fetch exchange rates')

  return data.conversion_rates
}

const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/`
