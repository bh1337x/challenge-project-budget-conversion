const db = require('../db')

module.exports = {
  create,
  findById,
  findByNameAndYear,
  findByNames,
  updateById,
  deleteById
}

async function create (projectBudget) {
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

async function findById (projectId) {
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

async function findByNameAndYear (projectName, year) {
  return new Promise((resolve, reject) => {
    db.selectQuery(
      'SELECT * FROM project WHERE projectName = ? AND year = ?',
      [projectName, year],
      (err, data) => {
        if (err) return reject(new Error('Failed to find project'))
        resolve(data)
      })
  })
}

async function findByNames (projectNames) {
  return new Promise((resolve, reject) => {
    db.selectQuery(
      `SELECT * FROM project WHERE projectName IN (${
        projectNames.map(_ => '?').join(',')
      })`,
      [...projectNames],
      (err, data) => {
        if (err) return reject(new Error('Failed to find projects'))
        resolve(data)
      }
    )
  })
}

async function updateById (projectId, projectBudget) {
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

async function deleteById (projectId) {
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
