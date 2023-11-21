const Page = require('./index')

module.exports = class extends Page {
  async _get (req, res, next) {
    this.authenticator.authenticate('oidc')(req, res, next)
  }
}
