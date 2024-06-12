const express = require('express')
const mw = require('./mw')

const app = module.exports = express()

app.use(mw.cors)
app.use(mw.logger)
app.use(mw.bodyParser)
app.use(mw.health)

app.use('/api', require('./endpoint'))

app.options('*', mw.cors)

app.use('*', (_req, res) => {
  res.status(404).send({ error: 'Not found' })
})

app.use((error, _req, res) => {
  res.status(500).send({ error })
})
