const Page = require('../clone')

module.exports = class extends Page {
  addOn = (req, res) => {
    return /* html */ `<div id="addOn">${res.locals.pathParams.join(':')}</div>`
  }
}
