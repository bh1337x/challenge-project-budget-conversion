const healthpoint = require('healthpoint')
const bodyParser = require('body-parser')
const pinoLogger = require('express-pino-logger')
const cors = require('cors')()
const db = require('./db')
const { version } = require('../package.json')

const hp = healthpoint({ version }, db.healthCheck)

module.exports = {
  cors,
  health,
  logger: logger(),
  bodyParser: bodyParser.json({ limit: '5mb' }),
  createAsyncHandler
}

function logger () {
  return pinoLogger({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    redact: [
      'res.headers["set-cookie"]',
      'req.headers.cookie',
      'req.headers.authorization'
    ]
  })
}

function health (req, res, next) {
  req.url === '/health' ? hp(req, res) : next()
}

/**
 * Wrap an async function so that any errors are passed to the next() function
 * @param {function(req, res, next): Promise<void>} fn
 * @returns {function(req, res, next): void}
 */
function createAsyncHandler (fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
