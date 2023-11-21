const Page = require('./index')

module.exports = class extends Page {
  async _get (req, res, next) {
    const destroySession = () => {
      req.session.destroy()
    }
    req.logout((err, req, res, next) => {
      if (err) return next(err)
      destroySession()
    })
    return res.redirect('/')
  }
}
