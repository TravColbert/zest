const passport = require('passport')
const { Strategy } = require('passport-custom')

const Users = [
  {
    username: "demo",
    password: "demo"
  }
]

module.exports = function (app) {
  // Disable authentication routines if !authenticate
  if (!app.locals.authenticate) {
    return
  }

  // Set up authentication
  app.use(passport.initialize())
  app.use(passport.session())

  // Setup Passport for custom strategy
  passport.use('local', new Strategy(
    function (req, done) {
      const user = Users.find(u => {
        return (u.username === req.body.username && u.password === req.body.username)
      })
      if (!user) return done(null, false, 'Bad username or password')
      app.locals.debug && console.debug(JSON.stringify(user))
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