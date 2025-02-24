const Page = require('./index')

module.exports = class extends Page {
  main = /* html */ `
    <section class="hero is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-1 has-text-centered">{{appTitle}}</h1>
          <p class="subtitle has-text-centered">{{tagLine}}</p>
          <div class="container has-text-centered">
            <form action="/login" method="post">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" required>
      
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
      
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `

  // async _get (req, res, next) {
  //   this.authenticator.authenticate(res.app.locals.authenticate)(req, res, next)
  // }

  async _post(req, res, next) {
    // console.log(req.body.username)
    // console.log(req.body.password)
    // console.log(res.app.locals.authenticate)
    this.authenticator.authenticate(res.app.locals.authenticate)(req, res, next)
    console.dir(`REDIRECTING TO: ${req.session.originalRequest}`)
    return res.redirect(req.session.originalRequest)
  }
}
