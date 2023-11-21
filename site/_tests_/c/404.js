const Page = require('../index')

module.exports = class extends Page {
  pageStatus = 404
  body = /* html */ `<div>Early 404</div>`
}