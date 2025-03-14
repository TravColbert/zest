/**
 * In this example, the _tests_/b/index.js file is a clone of ../clone.js.
 * The only difference it we redefine what the 'addOn' method does.
 * 
 * In ../clone, the 'addOn' method creates a div and allows for a method called
 * 'list' to be rendered.
 * 
 * In this file, our addOn div returns a string of the path parameters included
 * in the request. This means we can ask for _tests_/b/123 and get '123' back.
 * 
 * Or we can ask for _tests_/b/foo/bar and get 'foo:bar' back.
 * 
 * Those path parameters can be accessed and used in this page. * 
 */
const Page = require('../clone')

module.exports = class extends Page {
  addOn = (req, res) => {
    return /* html */ `
      <div id="addOn">${res.locals.pathParams.join(':')}</div>
    `
  }
}
