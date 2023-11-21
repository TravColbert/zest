const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises

// Support functions
/**
 * Create a list of possible responder modules.
 * 
 * The responder modules need to be accessible through file-system paths.
 * A request like: GET /_tests_/b/x/y in the browser needs to get 
 * translated to a potential list of files like this:
 * 
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/y/:get.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/y/index.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/y:get.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/y.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/:get.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/index.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/:get.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x/index.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x:get.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/x.js
 * - /home/travis/dev/zest-bulma/site/_tests_/b/:get.js
 * ! /home/travis/dev/zest-bulma/site/_tests_/b/index.js
 *
 * @param {*} req             Express req object
 * @param {*} res             Express res object
 * @param {string} searchPth  The starting point for the search. If null then req.path
 * @returns {Array} List of possible module locations to respond to the request
 */
const buildSearchPaths = (req, res, searchPath = null) => {
  if (!searchPath) searchPath = path.join(req.app.locals.webRoot, req.path)
  workingPath = path.join(req.app.locals.appRoot, searchPath)

  let searchPathList = [
    path.join(workingPath, `:${req.method}.js`),
    path.join(workingPath, 'index.js')
  ]

  console.log(`ENABLE 404: ${req.app.locals.enable404}`)
  if (!req.app.locals.enable404) searchPathList.push(path.join(workingPath, '404.js'))

  let targetFile = path.basename(searchPath)
  searchPath = path.dirname(searchPath)
  workingPath = path.join(req.app.locals.appRoot, searchPath)
  searchPathList.push(path.join(workingPath, `${targetFile}:${req.method}.js`))
  searchPathList.push(path.join(workingPath, `${targetFile}.js`))

  if (!req.app.locals.enable404) {
    if (searchPath !== '.') searchPathList = [...searchPathList, ...buildSearchPaths(req, res, searchPath)]
    searchPathList.push(path.join(workingPath, `:${req.method}.js`))
    searchPathList.push(path.join(workingPath, `index.js`))
  } else {
    searchPathList.push(path.join(workingPath, '404.js'))
  }
  return searchPathList
}

/**
 * Returns path parameters in an array
 *
 * For example:
 *   /line-items        => []
 *   /line-items/       => []
 *   /line-items/2      => ['2']
 *   /line-items/test/2 => ['test', '2']
 *
 * Usual usage: this.parsePathParams(req, res, __dirname)
 *
 * @param {*} req         Express req object
 * @param {*} res         Express res object
 * @param {*} modulePath  The calling module's __dirname path
 * @returns array         An array of the rest of the path that could be params
 */
const parsePathParams = (req, res, modulePath) => {
  const requestPath = req.path
  res.app.locals.debug && console.debug(`requestPath: \t\t${req.path}`)
  const absolutePathToSite = path.join(res.app.locals.appRoot, res.app.locals.webRoot)
  res.app.locals.debug && console.debug(`absolutePathToSite: \t${absolutePathToSite}`)
  const requestAbsolutePath = modulePath.replace(absolutePathToSite, '')
  res.app.locals.debug && console.debug(`requestAbsolutePath: \t${requestAbsolutePath}`)
  let paramPath = requestPath.replace(requestAbsolutePath)
  res.app.locals.debug && console.debug(`paramPath: \t\t${paramPath}`)
  res.app.locals.debug && console.debug(`responder: \t\t${path.dirname(res.locals.responder)}`)
  let test = res.locals.responder.replace(absolutePathToSite, '')
  res.app.locals.debug && console.debug(`responder: \t\t${path.dirname(test)}`)
  paramPath = paramPath.replace(path.dirname(test))
  let params = paramPath.split(path.sep)
  return params.filter(param => ['undefined', null, ''].indexOf(param) === -1)
}

// General-use middleware
const helloHandler = (req, _res, next) => {
  console.log(`${req.method}\t${req.originalUrl}`)
  next()
}

const startTimeHandler = (req, _res, next) => {
  req.startDate = new Date()
  next()
}

const initRequestHandler = (req, res, next) => {
  res.locals.templateModifier = ('_fragment' in req.query && req.get('HX-Request')) ? req.query._fragment : 'page'
  res.app.locals.debug && console.debug(`template start point: '${res.locals.templateModifier}'`)
  // Fetch pagination specifiers:
  //  limit = number of items per page
  //  page = number of the page to return
  res.locals.limit = ('limit' in req.query) ? parseInt(req.query.limit) : 20
  res.locals.page = ('page' in req.query) ? parseInt(req.query.page) : 0
  res.app.locals.debug && console.debug(`pagination - page: ${res.locals.page} limit: ${res.locals.limit}`)
  next()
}

const startSessionHandler = (req, res, next) => {
  res.locals.authenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
}

// Final response handler
const renderResponseHandler = (req, res) => {
  req.endDate = new Date()
  const duration = req.endDate - req.startDate
  res.set('Content-Type', res.locals.contentType || 'text/html')
  res.app.locals.debug && console.debug(`setting status to: ${res.locals.status || 200}`)
  res.status(res.locals.status || 200).send(res.locals.output)
  console.log(`completed:\t${duration} ms`)
}

module.exports = (webRoot, { notFoundHandler, authenticator }) => {
  const mainHandler = async (req, res, next) => {
    const requestPath = req.path
    const method = req.method.toLowerCase()
    const searchPathList = buildSearchPaths(req, res)
    res.app.locals.debug && console.debug(searchPathList)
    for (let index = 0; index < searchPathList.length; index++) {
      let found = false
      await fsPromises.access(searchPathList[index])
        .then(() => {
          console.log(`! ${searchPathList[index]}`)
          found = true
        })
        .catch(() => {
          res.app.locals.debug && console.debug(`- ${searchPathList[index]}`)
        })
      if (found) {
        const requestParams = requestPath.split('/')
        console.log(`route params:\t\t${JSON.stringify(requestParams)}`)
        res.locals.responder = searchPathList[index]
        res.locals.pathParams = parsePathParams(req, res, path.join(__dirname, webRoot))
        console.dir(res.locals.pathParams)
        const Responder = require(searchPathList[index])
        const responder = new Responder(authenticator)
        return responder[`_${method}`](req, res, next)
      }
    }

    console.log(`no route handler found for ${req.path}`)
    return notFoundHandler(req, res, next)
  }

  return [
    helloHandler,
    startTimeHandler,
    initRequestHandler,
    startSessionHandler,
    mainHandler,
    renderResponseHandler
  ]
}
