const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes, Op } = require('sequelize')

const hydrateDb = async (dbName, dbConfig, environment, debug) => {
  try {    
    debug && console.log(`preparing model for '${dbName}'`)
    debug && console.debug(' model environment: %s', environment)
    // Check if target db enviroment folder is there
    let modelPath = path.join(__dirname, '..', 'models', dbName, environment)
    if (!fs.existsSync(modelPath)) {
      console.error(' cannot find path to model definition: %s', modelPath)
      modelPath = path.join(__dirname, '..', 'models', dbName)
    } 
    debug && console.debug(' path to model definition: %s', modelPath)
  
    debug && console.dir(dbConfig)
    
    const db = new Sequelize(dbConfig)
    const modelFileNames = fs.readdirSync(modelPath, { withFileTypes: true }).filter(dirEntry => dirEntry.isFile())
  
    for (const modelFileName of modelFileNames) {
      const modelFile = path.join(modelPath, modelFileName.name)
      debug && console.debug(' model definition: %s:\t%s', modelFileName.name, modelFile)
      const model = require(modelFile)
      if ('definition' in model) await model.definition(db, DataTypes)
    }
  
    for (const modelFileName of modelFileNames) {
      const modelFile = path.join(modelPath, modelFileName.name)
      debug && console.debug(' model post-definition tasks - %s:\t%s', modelFileName.name, modelFile)
      const model = require(modelFile)
      if ('postDefinition' in model) await model.postDefinition(db, DataTypes, Op)
    }

    await db.sync()

    let seedPath = path.join(__dirname, '..', 'seeds', dbName, environment)
    if (!fs.existsSync(seedPath)) {
      console.error(' cannot find path to seed file for model: %s', seedPath)
      seedPath = path.join(__dirname, '..', 'seeds', dbName)
    }
    debug && console.debug(' path to seed definition: %s', seedPath)

    if (fs.existsSync(seedPath)) {
      const seedFiles = fs.readdirSync(seedPath, { withFileTypes: true }).filter(dirEntry => dirEntry.isFile())
      for (const seedFile of filterByExtension(seedFiles, ".js")) {
        const seed = path.join(seedPath, seedFile.name)
        debug && console.debug(' model seeding - %s', seedFile.name)
        require(seed)(db, debug)
      }
    }

    return db
  } catch(error) {
    console.debug(`Zest found this error as it was starting up the database:\n\t${error}`)
  }
}

const filterByExtension = (fileList, extension = ".js") => {
  return fileList.filter(file => (file.name.endsWith(extension)))
}

/**
 * 
 * @param {*} dbConfig 
 * @param {*} environment 
 * @param {*} debug 
 * @returns db
 */
module.exports = async function (dbConfig, environment, debug = true) {
  dbSources = {}

  for(const dbConfigName in dbConfig) {
    dbSources[dbConfigName] = await hydrateDb(dbConfigName, dbConfig[dbConfigName], environment, debug)
  }

  return dbSources
}
