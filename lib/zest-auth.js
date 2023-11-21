const passport = require('passport')
const { Strategy } = require('passport-openidconnect')

module.exports = function (app) {
  // Set up authentication
  app.use(passport.initialize())
  app.use(passport.session())

  // Setup Passport for use with Okta
  passport.use('oidc', new Strategy({
    issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
    authorizationURL: `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize`,
    tokenURL: `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/token`,
    userInfoURL: `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
    clientID: process.env.OKTA_OAUTH2_CLIENT_ID,
    clientSecret: process.env.OKTA_OAUTH2_CLIENT_SECRET,
    callbackURL: `${process.env.HOST_URL}/callback`,
    scope: 'openid profile'
  }, (issuer, profile, done) => {
    app.locals.debug && console.dir(profile)
    return done(null, profile)
  }))

  passport.serializeUser((user, next) => {
    next(null, user)
  })

  passport.deserializeUser((obj, next) => {
    next(null, obj)
  })

  return passport
}