const Page = require('../../lib/Page')

module.exports = class extends Page {
  body = /* html */ `
    <h1>Hello Zest!</h1>
    <div>{{addOn}}</div>
  `
}
