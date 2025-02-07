const path = require("path")
const fs = require("fs")
const fsPromises = fs.promises

/**
 * You can use DOM sanitizers or DOM editors by, for example, this:
 * const {JSDOM} = require('jsdom')
 * const {window} = new JSDOM('')
 * global.window = window
 * const DOMPurify = require('dompurify')
 *
 * Then, when you instantiate a responder (below) you would do something like:
 * const responder = new Responder(authenticator, global.window, DOMPurify.sanitize)
 */

/**
 * Create a list of possible responder modules.
 *
 * The responder modules need to be accessible through file-system paths.
 * A request like: GET /_tests_/b/x/y in the browser needs to get
 * translated to a potential list of files like this:
 *
 * - /dev/zest/site/_tests_/b/x/y/:get.js
 * - /dev/zest/site/_tests_/b/x/y/index.js
 * - /dev/zest/site/_tests_/b/x/y:get.js
 * - /dev/zest/site/_tests_/b/x/y.js
 * - /dev/zest/site/_tests_/b/x/:get.js
 * - /dev/zest/site/_tests_/b/x/index.js
 * - /dev/zest/site/_tests_/b/x/:get.js
 * - /dev/zest/site/_tests_/b/x/index.js
 * - /dev/zest/site/_tests_/b/x:get.js
 * - /dev/zest/site/_tests_/b/x.js
 * - /dev/zest/site/_tests_/b/:get.js
 * ! /dev/zest/site/_tests_/b/index.js
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
    path.join(workingPath, "index.js"),
  ]

  console.log(`ENABLE 404: ${req.app.locals.enable404}`)
  if (!req.app.locals.enable404)
    searchPathList.push(path.join(workingPath, "404.js"))

  let targetFile = path.basename(searchPath)
  searchPath = path.dirname(searchPath)
  workingPath = path.join(req.app.locals.appRoot, searchPath)
  searchPathList.push(path.join(workingPath, `${targetFile}:${req.method}.js`))
  searchPathList.push(path.join(workingPath, `${targetFile}.js`))

  if (!req.app.locals.enable404) {
    if (searchPath !== ".")
      searchPathList = [
        ...searchPathList,
        ...buildSearchPaths(req, res, searchPath),
      ]
    searchPathList.push(path.join(workingPath, `:${req.method}.js`))
    searchPathList.push(path.join(workingPath, `index.js`))
  } else {
    searchPathList.push(path.join(workingPath, "404.js"))
  }
  return searchPathList
}

/**
 * Returns path parameters in an array
 *
 * The purpose is to build a list of parameters that are 'extra' parts of the
 * path. These parameters get passed to the responder as parameters. For
 * example, if the request was made to:
 *
 *  /line-items/test/2
 *
 * and the responder is:
 *
 *  /line-items
 *
 * then 'test' and '2' should be provided to the responder as parameters.
 *
 * These would be provided in the form of an array: ['test', '2']
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
  // Request: GET /_tests_/a/3

  // /home/user/zest/site
  console.log(`modulePath:\t\t${modulePath}`)

  // /_tests_/a/
  const requestPath = req.path
  res.app.locals.debug && console.debug(`requestPath: \t\t${req.path}`)

  // /home/user/zest
  console.log(`res.app.locals.appRoot:\t\t${res.app.locals.appRoot}`)
  // site
  console.log(`res.app.locals.webRoot:\t\t${res.app.locals.webRoot}`)

  // /home/user/zest/site
  const absolutePathToSite = path.join(
    res.app.locals.appRoot,
    res.app.locals.webRoot
  )
  res.app.locals.debug &&
    console.debug(`absolutePathToSite: \t${absolutePathToSite}`)

  const requestAbsolutePath = modulePath.replace(absolutePathToSite, "")
  res.app.locals.debug &&
    console.debug(`requestAbsolutePath: \t${requestAbsolutePath}`)

  let paramPath = requestPath.replace(requestAbsolutePath)
  res.app.locals.debug && console.debug(`paramPath: \t\t${paramPath}`)
  res.app.locals.debug &&
    console.debug(`responder: \t\t${path.dirname(res.locals.responder)}`)
  let strippedResponderPath = res.locals.responder.replace(
    absolutePathToSite,
    ""
  )
  res.app.locals.debug &&
    console.debug(`responder: \t\t${path.dirname(strippedResponderPath)}`)
  paramPath = paramPath.replace(path.dirname(strippedResponderPath))
  let params = paramPath.split(path.sep)
  res.app.locals.debug && console.dir(params)
  return params.filter(param => ["undefined", null, ""].indexOf(param) === -1)
}

// General-use middleware
const helloHandler = (req, res, next) => {
  res.app.locals.debug && console.debug(`⭕️ hello`)
  console.log(`${req.method}\t${req.originalUrl}`)
  next()
}

const startTimeHandler = (req, res, next) => {
  req.startDate = new Date()
  res.app.locals.debug && console.debug(`⭕️starting: ${req.startDate}`)
  next()
}

const initRequestHandler = (req, res, next) => {
  req.app.locals.debug && console.debug(`⭕️pre-processing request`)
  /**
   * If we are in production mode then requesting a fragment requires sending
   * the HX-Request request header
   */
  if (res.app.locals.nodeEnv !== "production") {
    res.locals.templateModifier =
      "_fragment" in req.query ? req.query._fragment : "page"
  } else {
    res.locals.templateModifier =
      "_fragment" in req.query && req.get("HX-Request")
        ? req.query._fragment
        : "page"
  }
  res.app.locals.debug &&
    console.debug(`⭕️template start point: '${res.locals.templateModifier}'`)
  // Fetch pagination specifiers:
  //  limit = number of items per page
  //  page = number of the page to return
  res.locals.limit = "limit" in req.query ? parseInt(req.query.limit) : 20
  res.locals.page = "page" in req.query ? parseInt(req.query.page) : 0
  res.app.locals.debug &&
    console.debug(
      `⭕️pagination - page: ${res.locals.page} limit: ${res.locals.limit}`
    )
  next()
}

const startSessionHandler = (req, res, next) => {
  res.app.locals.debug && console.debug(`🔵 checking session`)
  res.locals.authenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
}

// Final response handler
const renderResponseHandler = (req, res) => {
  res.app.locals.debug && console.debug(`🟢 final response`)
  req.endDate = new Date()
  const duration = req.endDate - req.startDate
  res.set("Content-Type", res.locals.contentType || "text/html")
  res.app.locals.debug &&
    console.debug(`setting status to: ${res.locals.status || 200}`)
  res.status(res.locals.status || 200).send(res.locals.output)
  console.log(`completed:\t${duration} ms`)
}

const getResponder = async (searchPathList, debug) => {
  // Iterate over search path list to find a responder
  let responder = false
  for (let index = 0; index < searchPathList.length; index++) {
    try {
      await fsPromises.access(searchPathList[index])
      debug && console.debug(`🟢 ${searchPathList[index]}`)
      responder = searchPathList[index]
      break
    } catch {
      debug && console.debug(`🔴 ${searchPathList[index]}`)
    }
  }
  return responder
}

const buildRequestParams = path => {
  return path
    .split("/")
    .filter(pathPart => ["undefined", null, ""].indexOf(pathPart) == -1)
}

module.exports = (webRoot, { notFoundHandler, authenticator }) => {
  const mainHandler = async (req, res, next) => {
    /**
     * We try to set some key information, then launch the responder:
     * - res.locals.responder: the script that will be invoked to complete the response
     * - res.locals.requestParams: the requested path split into an array
     * */
    res.app.locals.debug && console.debug(`⭕️main request processing`)
    // const requestPath = req.path
    const method = req.method.toLowerCase()
    res.locals.searchPathList = buildSearchPaths(req, res)
    res.app.locals.debug && console.debug(res.locals.searchPathList)
    res.locals.responder = await getResponder(
      res.locals.searchPathList,
      res.app.locals.debug
    )

    if (!res.locals.responder) {
      console.log(`no route handler found for ${req.path}`)
      return notFoundHandler(req, res, next)
    }

    res.locals.requestParams = buildRequestParams(req.path)
    res.app.locals.debug &&
      console.debug(
        `route params:\t\t${JSON.stringify(res.locals.requestParams)}`
      ) // ["_tests_","a","1","2"]

    // res.locals.pathParams = parsePathParams(
    //   req,
    //   res,
    //   path.join(__dirname, "..", webRoot)
    // )
    // console.debug(`path params:\t\t${JSON.stringify(res.locals.pathParams)}`)
    const Responder = require(res.locals.responder)
    const responder = new Responder(authenticator)
    // Using call() allows us to set the 'this' to the responder
    return responder[`_${method}`].call(responder, req, res, next)
  }

  return [
    helloHandler,
    startTimeHandler,
    initRequestHandler,
    startSessionHandler,
    mainHandler,
    renderResponseHandler,
  ]
}
