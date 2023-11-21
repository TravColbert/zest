'use strict'
const zestDb = require('../lib/zest-db')

describe('DB can be created through Sequelize', () => {
  test('Single SQLite DB can be created', async () => {
    const dbConfig = {
      "zest": {
        "dialect": "sqlite",
        "dbConfig": "sqlite::memory"
      }
    }
    const db = await zestDb(dbConfig, 'test')
    const dbSources = Object.keys(db)
    expect(dbSources.length).toBe(1)
    expect(dbSources).toContain('zest')
  })
})