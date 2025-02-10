const passport = require('passport')
const { Strategy } = require('passport-custom')

const User = {
  username: "none"
}

module.exports = function (app) {
  // Disable authentication routines if !authenticate
  if (!app.locals.authenticate) {
    return
  }

  // Set up authentication
  app.use(passport.initialize())
  app.use(passport.session())

  // Setup Passport for custom strategy
  passport.use('none', new Strategy(
    function (req, done) {
      const user = User
      app.locals.debug && console.dir(user)
      return done(null, user)
    }
  ))

  passport.serializeUser((user, next) => {
    process.nextTick(() => {
      console.log(`\t\t***>>>${JSON.stringify(user)}`)
      next(null, {
        username: user.username
      })
    })
  })

  passport.deserializeUser((user, next) => {
    process.nextTick(() => {
      console.log(`\t\t***<<<${JSON.stringify(user)}`)
      next(null, user)
    })
  })

  return passport
}