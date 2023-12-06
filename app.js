'use strict'

module.exports = function(explicitConfig = {}) {
  /**
   * We configure Zest through 4 ways - all of them converge at different 
   * points:
   * 
   *  - explicit config ---------------------+
   *                                         |
   *  - environment (sh) --+-- process.env --+
   *                       |                 |
   *  - .env (file) -------+                 +-- app.locals (final config)
   *                                         |
   *  - config file -------------------------+
   * 
   * The exlicit config is when you pass a configuration JSON string to the 
   * appFactory, like this: 
   * 
   *   appFactory({ APP_TITLE: 'Sample App' })
   * 
   * Otherwise, Zest looks to Node's process.env property to configure itself.
   * There are 2 ways you can set the process.env property: shell or .env file.
   *  
   * The shell environment config is whatever variable the shell environement 
   * is set to. For example:
   * 
   *   export APP_TITLE='Sample App' && node server.js
   * 
   * You can also set the shell environment in your package.json like this:
   * 
   *  "scripts": {
   *    "test": "APP_TITLE='Sample App' node server.js"
   *  },
   * 
   * A .env file may also be used. The dotenv package will read the .env file 
   * and insert those values into process.env. Here is the contents of an 
   * equivelant .env file:
   * 
   *   APP_TITLE=Sample App
   * 
   * The .env file is parsed and merged into the process.env attribute.
   * 
   * Finally, a config file is retrieved.
   * 
   * The process.env and config files are merged into the app.locals.
   */
  require('dotenv').config()
  const path = require('path')
  const config = require('config')
  const express = require('express')
  const session = require('express-session')
  const MemoryStore = require('memorystore')(session)

  /**
   * Searches through all possible configuration sources to set up Zest
   * 
   * Starts with a default value. Proceeds with explicit config passed 
   * directly to the factory. Proceeds to environment set through .env.
   * Finally checks config files in config folder.
   *  
   * @param {*} valueKey      The key of the value being searched for 
   * @param {*} defaultValue  A default value
   * @param {*} showValue     Whether to print found value to console
   * @returns                 The found value
   */
  const getConfigValue = function(valueKey, defaultValue, showValue = false) {
    let value = defaultValue
    if (valueKey in explicitConfig) {     // config in explicit config?
      value = explicitConfig[valueKey]
    } else if (valueKey in process.env) { // config in process.env (shell environment)?
      value = process.env[valueKey]
    } else if (valueKey in config) {      // config in config file?
      value = config[valueKey]
    }
    showValue && console.debug(` config: ${valueKey} => ${value}`)
    return value
  }

  /**
   * TODO: handle promise rejection
   */
  return new Promise((resolve, reject) => {
    const app = express()

    // Application-level settings
    app.locals.nodeEnv = getConfigValue('NODE_ENV','development', true)
    app.locals.debug = getConfigValue('DEBUG', false, (app.locals.nodeEnv!=='production'))
    app.locals.port = getConfigValue('PORT', 3000, (app.locals.nodeEnv !== 'production'))
    app.locals.appRoot = __dirname
    !!(app.locals.nodeEnv !== 'production') && console.debug(` config: APP_ROOT => ${app.locals.appRoot}`)
    app.locals.webRoot = getConfigValue('WEB_ROOT', 'site', (app.locals.nodeEnv!=='production'))
    app.locals.publicRoot = getConfigValue('PUBLIC_ROOT', 'public', (app.locals.nodeEnv!=='production'))
    app.locals.cachingDisabled = getConfigValue('CACHING_DISABLED', true, app.locals.debug)
    app.locals.cachingDisabled && app.disable('etag')
    app.locals.disableXPoweredBy = getConfigValue('DISABLE_X_POWERED_BY', true, app.locals.debug)
    app.locals.disableXPoweredBy && app.disable('x-powered-by')
    /**
     * enable404: 
     * 
     * One of the key ideas of Zest is that requests for a path x/y/z climbs 
     * down the tree until it find a handler. So, if x/y/z is not found, then
     * x/y is checked for a handler.
     * As Zest climbs down the tree, the unhandled parts of the path are put
     * into an array produced by parsePathParams. So, the result of a miss at
     * x/y/z would be ["z"]. A miss at x/y would render ["y", "z"].
     *  
     * If enable404 is TRUE, then this path-traversal is disabled, which means
     * a 404 error will be immediately produced instead of Zest falling back 
     * to a handler somewhere else in the tree.
     * 
     * enable404 is FALSE, by default, allowing Zest to climb down the tree if
     * it gets a 'miss' at one level.
     * 
     * You can force a 404 to be produced if there is a 'miss' by putting a 
     * 404.js file at the point where you want it. 
     */
    app.locals.enable404 = getConfigValue('ENABLE_404', false, app.locals.debug)
    app.locals.appDescription = getConfigValue('APP_DESCRIPTION', 'Effortlessly build performant web applications using native web practices', app.locals.debug)
    app.locals.appImage = getConfigValue('APP_IMAGE', '/images/zest.png', app.locals.debug)
    app.locals.appTitle = getConfigValue('APP_TITLE', 'Zest', app.locals.debug)
    app.locals.appType = getConfigValue('APP_TYPE', 'website', app.locals.debug)
    app.locals.appUrl = getConfigValue('APP_URL', 'https://localhost:3000', app.locals.debug)
    app.locals.language = getConfigValue('LANGUAGE', 'en', app.locals.debug)
    app.locals.noResponseCodes = getConfigValue('NO_RESPONSE_CODES', false, app.locals.debug)
    app.locals.privateKey = getConfigValue('PRIVATE_KEY', null, false)
    app.locals.version = getConfigValue('VERSION', '1.0', app.locals.debug)
    app.locals.authorName = getConfigValue('AUTHOR_NAME', 'Travis Colbert', app.locals.debug)
    app.locals.authorLink = getConfigValue('AUTHOR_LINK', 'https://github.com/TravColbert/zest', app.locals.debug)
    app.locals.greetings = {
      en: 'Hi!',
      es: '¡Hola!',
      fr: 'Salut!',
      zh: '你好'
    }
    
    app.locals.dbConfig = {
      "zest": {
        "dialect": "sqlite",
        "verbose": false,
        "dbConfig": "sqlite::memory"
      }
    }

    if (process.env.DB_CONFIG) {
      app.locals.dbConfig = typeof process.env.DB_CONFIG === 'string' ? JSON.parse(process.env.DB_CONFIG) : process.env.DB_CONFIG
    } else if (config.DB_CONFIG) {
      app.locals.dbConfig = config.DB_CONFIG
    }

    return require(path.join(__dirname, '/lib/zest-db'))(app.locals.dbConfig, app.locals.nodeEnv, app.locals.debug)
      .then(db => {
        app.locals.db = db

        // session support
        app.use(
          session({
            cookie: { maxAge: getConfigValue('SESSION_MAX_AGE', 86400000, app.locals.debug) },
            store: new MemoryStore({
              checkPeriod: getConfigValue('SESSION_MAX_AGE', 86400000, app.locals.debug) // prune expired entries every 24h
            }),
            resave: getConfigValue('SESSION_RESAVE', false, app.locals.debug),
            secret: getConfigValue('APP_SECRET', 'you should really change this', false),
            saveUninitialized: getConfigValue('SESSION_SAVE_UNINITIALIZED', false, app.locals.debug) // don't create session until something stored
          })
        )
        
        // serve static files
        app.use(express.static(app.locals.publicRoot))
        // parse body params
        app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
        
        const errorHandler = require('./lib/500')
        const notFoundHandler = require('./lib/404')
        
        // Set up Zest
        app.use(require('./lib/zest')(app.locals.webRoot, {
          notFoundHandler,
          authenticator: require('./lib/zest-auth')(app)
        }))
        
        // handle server errors (500)
        app.use(errorHandler)
      
        resolve(app)
      })
      .catch(error => {
        console.error(error)
      })
  })
}
