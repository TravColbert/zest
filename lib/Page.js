const path = require('path')

module.exports = class Page {
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
    <script src="https://unpkg.com/htmx.org@1.8.6"></script>
    {{scriptsTop}}
    {{metaTop}}
  </head>
  
  <body>
    {{body}}
    {{scriptsBottom}}
  </body>
  
  </html>
  `

  htmlClasses = ''

  body = '<h1>Welcome to {{appTitle}}</h1>'

  linksTop = ''

  scriptsTop = ''

  scriptsBottom = ''

  appDescription (req) {
    return req.app.locals.appDescription || ''
  }
  
  appImage = (req) => {
    return req.app.locals.appImage || ''
  }
  
  appTitle (req) {
    return req.app.locals.appTitle
  }
 
  appType = (req) => {
    return req.app.locals.appType || 'website'
  }  
  
  appUrl = (req) => {
    return req.app.locals.appUrl || ''
  }  
  
  appVersion = (req) => {
    return req.app.locals.version || ''
  }

  authorLink = (req) => {
    return req.app.locals.authorLink
  }

  authorName = (req) => {
    return req.app.locals.authorName
  }  

  language (req) {
    return req.app.locals.language || 'en'
  }

  constructor (authenticator = null) {
    this.authenticator = authenticator
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
  // parsePathParams (req, res, modulePath) {
  //   const requestPath = req.path
  //   res.app.locals.debug && console.debug(`requestPath: \t\t${req.path}`)
  //   const absolutePathToSite = path.join(res.app.locals.appRoot, res.app.locals.webRoot)
  //   res.app.locals.debug && console.debug(`absolutePathToSite: \t${absolutePathToSite}`)
  //   const requestAbsolutePath = modulePath.replace(absolutePathToSite, '')
  //   res.app.locals.debug && console.debug(`requestAbsolutePath: \t${requestAbsolutePath}`)
  //   const paramPath = requestPath.replace(requestAbsolutePath)
  //   res.app.locals.debug && console.debug(`paramPath: \t\t${paramPath}`)
  //   let params = paramPath.split(path.sep)
  //   return params.filter(param => ['undefined', null, ''].indexOf(param) === -1)
  // }

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
  getContent (req, res, blockName = 'page') {
    res.app.locals.debug && console.debug(`trying to retrieve block: '${blockName}'`)
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
  findContentBlockHolders (string) {
    return string.match(this.blockHolderRegex)
  }

  /**
   * Removes the '{{' & '}}' from a string
   * 
   * @param {string} string   The text to have the '{{' and '}}' removed 
   * @returns {string}        The string with the '{{' and '}}' removed
   */
  stripContentBlockHolder (string) {
    return string.replace('{{', '').replace('}}', '')
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
        res.app.locals.debug && console.debug(`*** processing block content: ${match}`)
        let replacementContent = this.getContent(req, res, this.stripContentBlockHolder(match))
        if (replacementContent instanceof Function) {
          res.app.locals.debug && console.debug(`*** detected function: ${match}`)
          replacementContent = replacementContent(req, res)
        }
        res.app.locals.debug && console.debug(`*** resolved to: ${replacementContent}`)
        if (match !== replacementContent) replacementContent = this.renderContent(req, res, replacementContent)
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
  authenticationRequired (req) {
    if (typeof this.authenticate === 'function') {
      return this.authenticate()
    } else if (Array.isArray(this.authenticate)) {
      return this.authenticate.indexOf(req.method)
    }
    return this.authenticate || false
  }

  /**
   * Invokes authentication if authentication is required and the session is 
   * not authenticated.
   *  
   * @param {*} req   Express req object
   * @param {*} res   Express res object
   * @param {*} next  The next callback
   */
  authenticateIfNeeded (req, res, next) {
    if (this.authenticationRequired() && !res.locals.authenticated) this.authenticator.authenticate('oidc')(req, res, next)
  }

  /**
   * Performs setup functions on the class before HTTP responses are processed
   * 
   * @param {*} req 
   * @param {*} res 
   */
  pageSetup (req, res) {
    res.app.locals.debug && console.debug('\tPage setup running...')
  }

  /**
   * The default responder for HTTP GET requests
   * 
   * This is called after possible custom _getters are run. This method:
   *  1. checks if authentication is needed, saves the current URL, and 
   *     redirects to /login is so
   *  2. runs an uptional pageSetup method that might perform pre-render 
   *     functions
   *  3. starts rendering content at the starting point specified by 
   *     'templateModifier'
   * 
   *  Normally, 'templateModifier' points to 'page', which means render the 
   *  whole page. 'templateModifier' is what allows the HTMx functionality to
   *  pull a partial by simply including _format in the query string.
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  _get (req, res, next) {
    res.app.locals.debug && console.debug('(super) _get responding')
    res.app.locals.debug && console.debug(`*** authentication required: ${this.authenticationRequired()}`)
    res.app.locals.debug && console.dir(req.query)
    if (this.authenticationRequired(req) && !res.locals.authenticated) {
      req.session.originalRequest = req.originalUrl
      return res.redirect('/login')
    } 
    this.pageSetup(req, res)
    res.locals.status = this.pageStatus
    res.locals.output = this.renderContent(req, res, this.getContent(req, res, res.locals.templateModifier))
    next()
  }

  _delete (req, res, next) {
    res.app.locals.debug && console.debug('_delete responding')
    return this._get(req, res, next)
  }

  _post (req, res, next) {
    res.app.locals.debug && console.debug('_post responding')
    res.app.locals.debug && console.dir(req.body)
    return this._get(req, res, next)
  }

  _patch (req, res, next) {
    res.app.locals.debug && console.debug('_patch responding')
    return this._get(req, res, next)
  }

  _put (req, res, next) {
    res.app.locals.debug && console.debug('_put responding')
    return this._get(req, res, next)
  }
}
