const apiKey = require('../../config').currency.apiKey

const EXCHANGE_API_BASE = `https://v6.exchangerate-api.com/v6/${apiKey}`

module.exports = {
  convert
}

/**
 * Convert a currency amount
 * @param {string} fromCurrencyCode - ISO 4217 currency code to convert from
 * @param {string} toCurrencyCode - ISO 4217 currency code to convert to
 * @param {number} amount - Amount to convert
 * @returns {Promise<number>} - Converted amount
 */
async function convert (fromCurrencyCode, toCurrencyCode, amount) {
  if (process.env.NODE_ENV === 'test') return amount

  const response = await fetch(
    `${EXCHANGE_API_BASE}/pair/${fromCurrencyCode}/${toCurrencyCode}/${amount}`
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
