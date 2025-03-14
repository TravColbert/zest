/**
 * This file is called 404.js because it's a 404 page.
 * 
 * If no other page in this folder exists, then this will be the 404 page.
 * 
 * This is the order in which Zest will go looking for a file to be the 
 * 'responder' for this request:
 * [
      '/zest/site/_tests_/c/:GET.js',
      '/zest/site/_tests_/c/index.js',
      '/zest/site/_tests_/c/404.js',
      '/zest/site/_tests_/c:GET.js',
      '/zest/site/_tests_/c.js',
      '/zest/site/_tests_/:GET.js',
      '/zest/site/_tests_/index.js',
      '/zest/site/_tests_/404.js',
      '/zest/site/_tests_:GET.js',
      '/zest/site/_tests_.js',
      '/zest/site/:GET.js',
      '/zest/site/index.js',
      '/zest/site/404.js',
      '/zest/site:GET.js',
      '/zest/site.js',
      '/zest/:GET.js',
      '/zest/index.js',
      '/zest/:GET.js',
      '/zest/index.js',
      '/zest/:GET.js',
      '/zest/index.js'
    ]
 * 
 * We inherit from the 'Page' class, below. But, since this ia a 404 page, we 
 * could inherited from another 404 page elsewhere in the tree.
 * 
 * The effect would have been the same. If you wanted to customize _this_ 404, 
 * then you could simply redefine the 'body' property, below.
 */
const Page = require('../index')

module.exports = class extends Page {
  /**
   * The pageStatus property is optional. If not provided, Zest will respond
   * with a 200 status code.
   */
  pageStatus = 404

  /**
   * The body property is inherited from the 'Page' class required, above.
   * It's the HTML that will be sent to the client.
   * 
   * Setting the body property allows you to customize the 404 page.
   */
  body = /* html */ `<div>Early 404</div>`
}