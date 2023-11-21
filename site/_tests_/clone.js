const Page = require('./index')

module.exports = class extends Page {
  addOn = /* html */ `
    <div id="addon">Additional Markup</div>
    {{list}}
  `
}
