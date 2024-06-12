const express = require('express')
const isObjectValid = require('../../../validator')
const mw = require('../../../mw')
const validations = require('./validations')
const services = require('./services')

const endpoints = module.exports = express.Router()

endpoints.post('/currency', mw.asyncHandler(
  /**
   * @param {import('express').Request} req - Request object
   * @param {import('express').Response} res - Response object
   * @returns {Promise<void>}
   */
  async (req, res) => {
    const { isValid, errors } = isObjectValid(req.body, validations.currencyRules)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors
      })
    }

    /** @type {{ year: number, projectName: string, currency: string }} */
    const { year, projectName, currency } = req.body

    try {
      const projectBudgets = await services.findProjectBudgetsByNameAndYear(
        projectName,
        year
      )

      const currencyParts = currency.split('')
      const currencyPropertyName = `finalBudget${
        currencyParts[0].toUpperCase()
      }${
        currencyParts[1].toLowerCase()
      }${
        currencyParts[2].toLowerCase()
      }`

      for (const projectBudget of projectBudgets) {
        if (projectBudget.currency === currency) {
          projectBudget.finalBudgetUsd = projectBudget.budgetUsd
        } else {
          projectBudget[currencyPropertyName] = await services.convertCurrency(
            /**
             * since we know that finalBudgetUsd is in USD,
             * we can safely use USD as the fromCurrencyCode
             * and ignore the currency property of the projectBudget
             */
            'USD',
            currency,
            projectBudget.finalBudgetUsd
          )
        }
      }

      res.status(200).json({
        success: true,
        data: projectBudgets
      })
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e.message
      })
    }
  }
))

endpoints.get('/:id', mw.asyncHandler(
  /**
   * @param {import('express').Request} req - Request object
   * @param {import('express').Response} res - Response object
   * @returns {Promise<void>}
   */
  async (req, res) => {
    const { id } = req.params
    if (isNaN(+id)) return res.sendStatus(400)

    try {
      const projectBudget = await services.findProjectBudgetByProjectId(+id)
      if (!projectBudget) return res.sendStatus(404)

      res.status(200).json(projectBudget)
    } catch (e) {
      res.sendStatus(500)
    }
  }
))
