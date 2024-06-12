process.env.NODE_ENV = 'test'

const http = require('http')
const test = require('tape')
const servertest = require('servertest')
const app = require('../lib/app')
const db = require('../lib/db')
const seed = require('../scripts/seed')

const server = http.createServer(app)

test('SETUP', function (t) {
  seed(function () {
    t.end()
  }, false)
})

test('GET /health should return 200', function (t) {
  servertest(server, '/health', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.end()
  })
})

test('GET /api/ok should return 200', function (t) {
  servertest(server, '/api/ok', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.ok, 'Should return a body')
    t.end()
  })
})

test('GET /nonexistent should return 404', function (t) {
  servertest(server, '/nonexistent', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('POST /api/project/budget/currency should return success', function (t) {
  const req = servertest(server, '/api/project/budget/currency', {
    method: 'POST',
    encoding: 'json',
    headers: {
      'Content-Type': 'application/json'
    }
  }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success')
    t.end()
  })

  req.write(JSON.stringify({
    year: 2024,
    projectName: 'Humitas Hewlett Packard',
    currency: 'TTD'
  }))
  req.end()
})

test('GET /api/project/budget/:id should return 400 on invalid id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/invalid',
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 400, 'Should return 400')
        t.end()
      }
    )
  }
)

test('GET /api/project/budget/:id should return 404 on nonexistent id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/999',
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 404, 'Should return 404')
        t.end()
      }
    )
  }
)

test('GET /api/project/budget/:id should return 200 on valid id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/1',
      { encoding: 'json' },
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 200, 'Should return 200')
        t.equal(res.body.projectId, 1, 'Should return project')
        t.end()
      }
    )
  }
)

test('TEARDOWN', function (t) {
  server.close(function () {
    db.close(function () {
      t.end()
    })
  })
})
