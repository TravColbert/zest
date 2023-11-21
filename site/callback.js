const Page = require('./index')

module.exports = class extends Page {
  async _get (req, res, next) {
    return this.authenticator.authenticate('oidc', {
      successRedirect: req.session.originalRequest || '/',
      failureRedirect: '/fail'
    })(req, res, next)
  }
}
