const db = require('../../../db')

module.exports = {
  findProjectBudgetById,
  findProjectBudgetsByNameAndYear,
  createProjectBudget,
  updateProjectBudgetById,
  deleteProjectBudgetById,
  convertCurrency
}

/**
 * @typedef {{
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
 * }} ProjectBudget
 */

/**
 * Find a project budget by project ID
 * @param {number} projectId - Project ID
 * @returns {Promise<ProjectBudget>} - Project budget data
 */
async function findProjectBudgetById (projectId) {
  return new Promise((resolve, reject) => {
    db.selectQuery(
      'SELECT * FROM project WHERE projectId = ?',
      [projectId],
      (err, data) => {
        if (err) return reject(new Error('Failed to find project'))
        if (data.length === 0) return resolve(null)
        resolve(data[0])
      })
  })
}

/**
 * Find a project budget by name and year
 * @param {string} name - Project name
 * @param {number} year - Project year
 * @returns {Promise<ProjectBudget[]>} - Project budget data
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
 * Create a project budget
 * @param {ProjectBudget} projectBudget - Project budget data
 */
async function createProjectBudget (projectBudget) {
  return new Promise((resolve, reject) => {
    db.executeQuery(
      'INSERT INTO project values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        projectBudget.projectId,
        projectBudget.projectName,
        projectBudget.year,
        projectBudget.currency,
        projectBudget.initialBudgetLocal,
        projectBudget.budgetUsd,
        projectBudget.initialScheduleEstimateMonths,
        projectBudget.adjustedScheduleEstimateMonths,
        projectBudget.contingencyRate,
        projectBudget.escalationRate,
        projectBudget.finalBudgetUsd
      ],
      (err) => {
        if (err) return reject(new Error('Failed to create project'))
        resolve()
      }
    )
  })
}

/**
 * Update a project budget by ID
 * @param {number} projectId - Project ID
 * @param {Omit<ProjectBudget, 'projectId'>} projectBudget - Project budget data
 */
async function updateProjectBudgetById (projectId, projectBudget) {
  return new Promise((resolve, reject) => {
    db.executeQuery(
      `UPDATE project SET
        projectName = ?,
        year = ?,
        currency = ?,
        initialBudgetLocal = ?,
        budgetUsd = ?,
        initialScheduleEstimateMonths = ?,
        adjustedScheduleEstimateMonths = ?,
        contingencyRate = ?,
        escalationRate = ?,
        finalBudgetUsd = ?
      WHERE projectId = ?`,
      [
        projectBudget.projectName,
        projectBudget.year,
        projectBudget.currency,
        projectBudget.initialBudgetLocal,
        projectBudget.budgetUsd,
        projectBudget.initialScheduleEstimateMonths,
        projectBudget.adjustedScheduleEstimateMonths,
        projectBudget.contingencyRate,
        projectBudget.escalationRate,
        projectBudget.finalBudgetUsd,
        projectId
      ],
      (err) => {
        if (err) return reject(new Error('Failed to update project'))
        resolve()
      }
    )
  })
}

/**
 * Delete a project budget by ID
 * @param {number} projectId - Project ID
 */
async function deleteProjectBudgetById (projectId) {
  return new Promise((resolve, reject) => {
    db.executeQuery(
      'DELETE FROM project WHERE projectId = ?',
      [projectId],
      (err) => {
        if (err) return reject(new Error('Failed to delete project'))
        resolve()
      }
    )
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
    `${EXCHANGE_API_URL}/pair/${fromCurrencyCode}/${toCurrencyCode}/${amount}`
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

const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}`
