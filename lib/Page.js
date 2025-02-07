const zestPartialHelpers = require("./zest-partial-helpers")
const path = require("node:path")
const methods = [":GET", ":POST", ":PUSH", ":PUT", ":DELETE", ":HEAD"]

module.exports = class Page {
  // #modelIndex = 0

  // #instanceIndex = 1

  /**
   * The regex definition of a block specifier.
   *
   * This is normally: {{block_name}}
   *
   * @type {string}
   */
  blockHolderRegex = /{{[^}]*}}/g

  /**
   * The main page definition.
   *
   * @type {string}
   */
  page = /* html */ `
  <!doctype html>
  <html class="no-js {{htmlClasses}}" lang="{{language}}">
  
  <head>
    <meta charset="utf-8">
    <title>{{appTitle}}</title>
    <meta name="description" content="{{appDescription}}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  
    <meta property="og:title" content="{{appTitle}}">
    <meta property="og:type" content="{{appType}}">
    <meta property="og:url" content="{{appUrl}}">
    <meta property="og:image" content="{{appImage}}">
    <meta property="og:description" content="{{appDescription}}">

    <link rel="manifest" href="/site.webmanifest">
    <link rel="apple-touch-icon" href="/icon.png">
    {{linksTop}}
    <script src="https://unpkg.com/htmx.org@1.9.9"></script>
    {{scriptsTop}}
    {{metaTop}}
  </head>
  
  <body>
    {{body}}
    {{scriptsBottom}}
  </body>
  
  </html>
  `

  htmlClasses = ""

  body = /* html */ `
    <h1>Welcome to {{appTitle}}</h1>
    <h2>{{modelName}}</h2>
    <div>{{modelTable}}</div>
  `

  modelTable = /* html */ `
    <table id="{{modelName}}_table">
      {{modelTableHeader}}
      {{modelTableBody}}
    </table>
  `

  modelTableHeader = (req, res) => {
    return zestPartialHelpers.modelTableHeader(req, { addActions: true })
  }

  modelTableBody = (req, res) => {
    return zestPartialHelpers.modelTableBody(req, { addActions: true })
  }

  modelName = (req, res) => {
    return `${req.app.locals.modelName}`
  }

  linksTop = ""

  scriptsTop = ""

  metaTop = ""

  scriptsBottom = ""

  appDescription(req) {
    return req.app.locals.appDescription || ""
  }

  appImage = req => {
    return req.app.locals.appImage || ""
  }

  appTitle(req) {
    return req.app.locals.appTitle
  }

  appType = req => {
    return req.app.locals.appType || "website"
  }

  appUrl = req => {
    return req.app.locals.appUrl || ""
  }

  appVersion = req => {
    return req.app.locals.version || ""
  }

  authorLink = req => {
    return req.app.locals.authorLink
  }

  authorName = req => {
    return req.app.locals.authorName
  }

  language(req) {
    return req.app.locals.language || "en"
  }

  // modelIndex = () => {
  //   return this.#modelIndex
  // }

  // instanceIndex = () => {
  //   return this.#instanceIndex
  // }

  constructor(
    authenticator = null,
    dom = null,
    sanitizer = renderString => {
      return renderString
    }
  ) {
    this.authenticator = authenticator
    this.dom = dom
    this.sanitizer = sanitizer
  }

  /**
   * Retrieves the named block from the current page instance and returns a
   * string to be inserted into the page.
   *
   * Block names are specified like this: {{block_name}} in templates. They
   * are defined as a property of the class either as a string or a method
   * that returns a string.
   *
   * @param {*} req             Express req object
   * @param {*} res             Express res object
   * @param {string} blockName  Name of the block to search for
   * @returns {string}          A string to be inserted into the resulting page
   */
  getContent(req, res, blockName = "page") {
    res.app.locals.debug &&
      console.debug(`trying to retrieve block: '${blockName}'`)
    if (blockName in this) {
      res.app.locals.debug && console.debug(`found '${blockName}' in class`)
      if (this[blockName] instanceof Function) {
        res.app.locals.debug && console.debug(`'${blockName}' is a function`)
        return this[blockName](req, res)
      }
      res.app.locals.debug && console.debug(`'${blockName}' is a string`)
      return this[blockName]
    }
    console.error(`could not find block: '${blockName}'`)
    return `{{${blockName}}}`
  }

  /**
   * Search a template string for blocks specified as {{block_name}}.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
   *
   * @param {string} string     The template that is to be searched
   * @returns {(string[]|null)} The array of matches
   */
  findContentBlockHolders(string) {
    return string.match(this.blockHolderRegex)
  }

  /**
   * Removes the '{{' & '}}' from a string
   *
   * @param {string} string   The text to have the '{{' and '}}' removed
   * @returns {string}        The string with the '{{' and '}}' removed
   */
  stripContentBlockHolder(string) {
    return string.replace("{{", "").replace("}}", "")
  }

  /**
   * Scans content text and iterates over all blocks, resolving their content
   * to a final HTML page.
   *
   * Returns a string with all text and blocks resolved into the final rendered HTML string.
   *
   * @param {*} req           Express req object
   * @param {*} res           Express res object
   * @param {string} content  The string content to render
   * @returns {string}        The renderable HTML page
   */
  renderContent = (req, res, content) => {
    const contentBlockHolderMatches = this.findContentBlockHolders(content)
    if (contentBlockHolderMatches) {
      contentBlockHolderMatches.forEach(match => {
        res.app.locals.debug &&
          console.debug(`*** processing block content: ${match}`)
        let replacementContent = this.getContent(
          req,
          res,
          this.stripContentBlockHolder(match)
        )
        if (replacementContent instanceof Function) {
          res.app.locals.debug &&
            console.debug(`*** detected function: ${match}`)
          replacementContent = replacementContent(req, res)
        }
        res.app.locals.debug &&
          console.debug(`*** resolved to: ${replacementContent}`)
        if (match !== replacementContent)
          replacementContent = this.renderContent(req, res, replacementContent)
        content = content.replace(match, replacementContent)
      })
    }
    return content
  }

  /**
   * Returns if authentication is required based on the current configuration
   * of the page class.
   *
   * Checks the 'authenticate' property in the current page class for trueness.
   *
   * If the authenticate property is a function, then it returns the result of
   * the function.
   *
   * The 'authenticate' property can be an array of HTTP methods where
   * authentication is required such as:
   *
   * ['GET','POST']
   *
   * The above would mean that authentication is required for a GET or POST
   * request to this page class.
   *
   * Otherwise, it returns the value of the authenticate property.
   *
   * If the 'authenticate' property is not defined in the class, then return
   * FALSE.
   *
   * @param {*} req   The Express req object
   * @returns
   */
  pageRequiresAuthentication(req) {
    if (typeof this.authenticate === "function") {
      return this.authenticate()
    } else if (Array.isArray(this.authenticate)) {
      return this.authenticate.indexOf(req.method)
    }
    return this.authenticate || false
  }

  authenticationRequired(req) {
    console.log(`*****************`)
    console.log(`**** this.pageRequiresAuthentication(req)`)
    console.log(this.pageRequiresAuthentication(req))
    console.log(`**** req.user`)
    console.dir(req.user)
    console.log(`**** req.isAuthenticated()`)
    console.log(req.isAuthenticated())
    console.log(`**** req.session.originalRequest`)
    console.dir(req.session.originalRequest)
    return (
      this.authenticator &&
      this.pageRequiresAuthentication(req) &&
      !req.isAuthenticated()
    )
  }

  /**
   * Invokes authentication if authentication is required and the session is
   * not authenticated.
   *
   * @param {*} req   Express req object
   * @param {*} res   Express res object
   * @param {*} next  The next callback
   */
  authenticateIfNeeded(req, res, next) {
    if (this.pageRequiresAuthentication() && !res.locals.authenticated)
      this.authenticator.authenticate(res.app.locals.authenticate)(
        req,
        res,
        next
      )
  }

  /**
   * Performs setup functions on the class before HTTP responses are processed
   *
   * @param {*} req
   * @param {*} res
   */
  pageSetup(req, res) {
    res.app.locals.debug && console.group("(super) Page setup...")
    res.app.locals.debug &&
      console.debug(`route params: ${JSON.stringify(res.locals.requestParams)}`)
    res.app.locals.debug &&
      console.debug(`route responder: ${JSON.stringify(res.locals.responder)}`)

    /**
     * modelIndex and instanceIndex may be set explicitly in the responder.
     *
     * The modelIndex attempts to pull the model name from the appropriate
     * element requestParams array (e.g. ["_tests_", "cities", "1"]) and put
     * it in the res.locals.model property for use later.
     *
     * The instanceIndex attempts to pull the value that represents the
     * instance or record of the model and store that in res.locals.instance
     */
    res.locals.model = res.locals.requestParams[this.modelIndex || 0] || null
    res.locals.instance =
      res.locals.requestParams[this.instanceIndex || this.modelIndex + 1] ||
      null

    res.app.locals.debug && console.debug(`model: ${res.locals.model}`)
    res.app.locals.debug && console.debug(`instance: ${res.locals.instance}`)

    res.app.locals.debug && console.groupEnd()
  }

  /**
   * This is the default model search clause.
   *
   * It searches for ALL records and orders them by createdAt DESC
   *
   * Of course, you can override this in your page instances deeper in the
   * site.
   */
  modelSearchParams = {
    where: {},
    order: [["createdAt", "DESC"]],
  }

  /**
   * Determines if there is a model that can be assumed for this page.
   *
   * Sets the req.app.locals.selectedModel with the chosen model name
   *
   * The potential models are derived from:
   *
   *  - req.app.locals.requestedModel - this is derived from the path
   *                                    of the responding page
   *  - req.app.locals.pathParams - this is derived from the
   *                                'parsePathparams()' method
   *
   * Zest will check the DB in the above order for an appropriate model
   *
   * @param {*} req   Express req object
   * @param {*} res   Express res object
   */
  modelSetup(req, res) {
    const dbNames = Object.keys(req.app.locals.db)
    console.debug(`DB names:\t\t${JSON.stringify(dbNames)}`)

    console.debug(
      `searching for table: '${res.locals.model}' in configured DBs`
    )

    let parentDbName = dbNames.filter(dbName => {
      return res.locals.model in req.app.locals.db[dbName].models
    })

    console.debug(`parent DB name: '${parentDbName}'`)
    return parentDbName.length > 0
      ? [parentDbName, res.locals.model]
      : [false, res.locals.model]
  }

  /**
   * The default responder for HTTP GET requests
   *
   * This is called after possible custom _getters are run. This method:
   *  1. checks if authentication is needed, saves the current URL, and
   *     redirects to /login if so
   *  2. runs an uptional pageSetup method that might perform pre-render
   *     functions
   *  3. starts rendering content at the starting point specified by
   *     'templateModifier'
   *
   *  Normally, 'templateModifier' points to 'page', which means render the
   *  whole page. 'templateModifier' is what allows the HTMx functionality to
   *  pull a partial by simply including "_fragment" in the query string.
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async _get(req, res, next) {
    res.app.locals.debug && console.group("(super) _get responding")
    res.app.locals.debug &&
      console.debug(`query string: ${JSON.stringify(req.query)}`)
    if (this.authenticationRequired(req)) {
      res.app.locals.debug && console.debug(`Redirecting to /login`)
      req.session.originalRequest = req.originalUrl
      return res.redirect("/login")
    }
    this.pageSetup(req, res)
    let [selectedDb, selectedModel] = await this.modelSetup(req, res)
    if (!selectedDb) {
      res.app.locals.debug &&
        console.debug(`Cannot find a DB for model: ${selectedModel}`)
      res.app.locals.debug &&
        console.debug(`assuming it is defined in the page`)
    } else {
      res.app.locals.debug && console.debug(`SELECTED DB: ${selectedDb}`)
      res.app.locals.debug && console.debug(`SELECTED MODEL: ${selectedModel}`)
      res.app.locals.debug &&
        console.debug(`SELECTED INSTANCE: ${res.locals.instance}`)
      if (res.locals.instance) {
        this.modelSearchParams.where.id = res.locals.instance
      }
      this.modelSearchParams.limit = res.locals.limit
      this.modelSearchParams.offset = res.locals.page
      req.app.locals.dbName = selectedDb
      req.app.locals.modelName = selectedModel
      res.app.locals.debug &&
        console.debug(
          `MODEL SEARCH PARAMS: ${JSON.stringify(this.modelSearchParams)}`
        )
      req.app.locals.model = await res.app.locals.db[selectedDb].models[
        selectedModel
      ]?.findAll(this.modelSearchParams)
    }
    res.locals.status = this.pageStatus
    if (res.locals.templateModifier === "page") {
      res.locals.output = this.renderContent(
        req,
        res,
        this.getContent(req, res, res.locals.templateModifier)
      )
    } else {
      res.locals.output = this.sanitizer(
        this.renderContent(
          req,
          res,
          this.getContent(req, res, res.locals.templateModifier)
        ),
        { SAFE_FOR_TEMPLATES: true }
      )
    }
    res.app.locals.debug && console.groupEnd()
    await next()
  }

  async _delete(req, res, next) {
    res.app.locals.debug && console.debug("_delete responding")

    await this._get(req, res, next)
  }

  async _post(req, res, next) {
    res.app.locals.debug && console.debug("(super) _post responding")
    res.app.locals.debug && console.log(`\t body: ${JSON.stringify(req.body)}`)
    res.app.locals.debug && console.dir(req.query)
    if (this.authenticationRequired(req)) {
      res.app.locals.debug && console.debug(`\tRedirecting to /login`)
      req.session.originalRequest = req.originalUrl
      return res.redirect("/login")
    }
    this.pageSetup(req, res)
    let [selectedDb, selectedModel] = await this.modelSetup(req, res)
    if (!selectedDb) {
      console.debug(`\t\tCannot find a DB for model: ${selectedModel}`)
    } else {
      console.debug(`\t\tSELECTED DB: ${selectedDb}`)
      console.debug(`\t\tSELECTED MODEL: ${selectedModel}`)
      req.app.locals.dbName = selectedDb
      req.app.locals.modelName = selectedModel
      req.app.locals.model = await res.app.locals.db[selectedDb].models[
        selectedModel
      ]?.create(req.body)
    }
    res.locals.status = this.pageStatus
    await this._get(req, res, next)
    // await next()
  }

  async _patch(req, res, next) {
    res.app.locals.debug && console.debug("(super) _patch responding")
    res.app.locals.debug && console.log(`\t query string:`)
    res.app.locals.debug && console.dir(req.query)
    if (this.authenticationRequired(req)) {
      res.app.locals.debug && console.debug(`\tRedirecting to /login`)
      req.session.originalRequest = req.originalUrl
      return res.redirect("/login")
    }
    this.pageSetup(req, res)
    let [selectedDb, selectedModel] = await this.modelSetup(req, res)
    if (!selectedDb) {
      console.debug(`\t\tCannot find a DB for model: ${selectedModel}`)
      console.debug(`assuming it is defined in the page`)
    } else {
      console.debug(`\t\tSELECTED DB: ${selectedDb}`)
      console.debug(`\t\tSELECTED MODEL: ${selectedModel}`)
      console.debug(`\t\tSELECTED INSTANCE: ${res.locals.instance}`)
      if (res.locals.instance) {
        this.modelSearchParams.where.id = res.locals.instance
      }
    }

    console.dir(JSON.stringify(req.body))
    await this._get(req, res, next)
  }

  async _put(req, res, next) {
    res.app.locals.debug && console.debug("_put responding")
    return this._get(req, res, next)
  }
}
