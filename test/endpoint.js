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

test('GET /api/project/budget/currency should return 400 on invalid body',
  function (t) {
    const req = servertest(server, '/api/project/budget/currency', {
      method: 'POST',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.ok(res.body.error, 'Should return an error')
      t.end()
    })

    req.write(JSON.stringify({}))
    req.end()
  }
)

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
    t.true(res.body.success, 'Should have success as true')
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

test('POST /api/project/budget should return 400 on empty body',
  function (t) {
    const req = servertest(server, '/api/project/budget', {
      method: 'POST',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.ok(res.body.error, 'Should return an error')
      t.end()
    })

    req.write(JSON.stringify({}))
    req.end()
  }
)

test('POST /api/project/budget should return 400 on invalid & missing fields',
  function (t) {
    const req = servertest(server, '/api/project/budget', {
      method: 'POST',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.ok(res.body.error, 'Should return an error')
      t.end()
    })

    req.write(JSON.stringify({
      projectId: 'invalid',
      projectName: 'Humitas Hewlett Packard',
      year: 2024,
      currency: 'Ttd',
      budgetUsd: 100000
    }))
    req.end()
  }
)

test('POST /api/project/budget should return 400 on existing project id',
  function (t) {
    const req = servertest(server, '/api/project/budget', {
      method: 'POST',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.equal(
        res.body.error,
        'Budget with this project ID already exists',
        'Should return an error message'
      )
      t.end()
    })

    req.write(JSON.stringify({
      projectId: 1,
      projectName: 'Humitas Hewlett Packard',
      year: 2024,
      currency: 'TTD',
      initialBudgetLocal: 100000,
      budgetUsd: 100000,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 0.1,
      escalationRate: 0.1,
      finalBudgetUsd: 100000
    }))
    req.end()
  }
)

test('POST /api/project/budget should return success on valid body',
  function (t) {
    const req = servertest(server, '/api/project/budget', {
      method: 'POST',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      t.true(res.body.success, 'Should have success as true')
      t.end()
    })

    req.write(JSON.stringify({
      projectId: 1337,
      projectName: 'Bakhteyar Haider',
      year: 2024,
      currency: 'USD',
      initialBudgetLocal: 100000,
      budgetUsd: 100000,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 0.1,
      escalationRate: 0.1,
      finalBudgetUsd: 100000
    }))
    req.end()
  }
)

test('PUT /api/project/budget/:id should return 400 on empty body',
  function (t) {
    const req = servertest(server, '/api/project/budget/1', {
      method: 'PUT',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.ok(res.body.error, 'Should return an error')
      t.end()
    })

    req.write(JSON.stringify({}))
    req.end()
  }
)

test('PUT /api/project/budget/:id should return 400 on invalid & missing fields',
  function (t) {
    const req = servertest(server, '/api/project/budget/invalid', {
      method: 'PUT',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.false(res.body.success, 'Should have success as false')
      t.ok(res.body.error, 'Should return an error')
      t.end()
    })

    req.write(JSON.stringify({
      projectName: 'Humitas Hewlett Packard',
      year: 2024,
      currency: 'Ttd',
      budgetUsd: 100000
    }))
    req.end()
  }
)

test('PUT /api/project/budget/:id should return 404 on nonexistent project id',
  function (t) {
    const req = servertest(server, '/api/project/budget/999', {
      method: 'PUT',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.false(res.body.success, 'Should have success as false')
      t.end()
    })

    req.write(JSON.stringify({
      projectId: 999,
      projectName: 'Humitas Hewlett Packard',
      year: 2024,
      currency: 'TTD',
      initialBudgetLocal: 100000,
      budgetUsd: 100000,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 0.1,
      escalationRate: 0.1,
      finalBudgetUsd: 100000
    }))
    req.end()
  }
)

test('PUT /api/project/budget/:id should return success on valid body',
  function (t) {
    const req = servertest(server, '/api/project/budget/1337', {
      method: 'PUT',
      encoding: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.true(res.body.success, 'Should have success as true')
      t.end()
    })

    req.write(JSON.stringify({
      projectName: 'Shah Bakhteyar Haider',
      year: 2024,
      currency: 'TTD',
      initialBudgetLocal: 100000,
      budgetUsd: 100000,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 0.1,
      escalationRate: 0.1,
      finalBudgetUsd: 100000
    }))
    req.end()
  }
)

test('DELETE /api/project/budget/:id should return 400 on invalid project id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/invalid',
      { method: 'DELETE', encoding: 'json' },
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 400, 'Should return 400')
        t.false(res.body.success, 'Should have success as false')
        t.end()
      }
    )
  }
)

test('DELETE /api/project/budget/:id should return 404 on nonexistent project id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/999',
      { method: 'DELETE', encoding: 'json' },
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 404, 'Should return 404')
        t.false(res.body.success, 'Should have success as false')
        t.end()
      }
    )
  }
)

test('DELETE /api/project/budget/:id should return success on valid project id',
  function (t) {
    servertest(
      server,
      '/api/project/budget/1337',
      { method: 'DELETE', encoding: 'json' },
      function (err, res) {
        t.error(err, 'No error')
        t.equal(res.statusCode, 200, 'Should return 200')
        t.true(res.body.success, 'Should have success as true')
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
