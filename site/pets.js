/**
 * The pets page inherits from the index page in the same directory
 * That means whatever is defined in ./index gets inherited in the
 * pets page.
 * 
 * This allows us to set up a chain of inheritance from the root of 
 * our web app. So, we only have to redefine what is necessary from 
 * page to page. 
 */
const Page = require('./index')

module.exports = class extends Page {
  // We update the 'body' to include a list of pets
  body = /* html */ `
    <h1>Hello Zest!</h1>
    <div>{{modelTable}}</div>
  `

  /**
   * We have requested a thing called 'modelList', above. We could have named 
   * it anything, it's just either a:
   *  - a template partial
   *  - a function
   *  that returns a string of HTML.
   * 
   *  In this case, we'll use a function. Functions can accept the req and res
   *  objects like typical Express middlewares would.
   */

  /**
   * When a GET request is made a middleware function called _get is 
   * autommatically run. The _get method expects a 
   * 'modelSearchParams' object that lets us specify what to auto-
   * search for. All we need to do is define that object.
   * 
   * The results of the search will be put into a variable called:
   * 'model'
   */
}
