'use strict'
const zestDb = require('../lib/zest-db')

describe('DB can be created through Sequelize', () => {
  test('Multiple SQLite DBs can be created', async () => {
    const dbConfig = {
      "zest": {
        "dialect": "sqlite",
        "dbConfig": "sqlite::memory"
      },
      "additional-tests": {
        "dialect": "sqlite",
        "dbConfig": "sqlite::memory"
      }
    }
    const db = await zestDb(dbConfig, 'test', false)
    const dbSources = Object.keys(db)
    expect(dbSources.length).toBe(2)
    expect(dbSources).toContain('additional-tests')
  })
})