'use strict'

const appFactory = require('./app')

appFactory()
  .then(app => {
    app.listen(app.locals.port, () => console.log(`Listening on port: ${app.locals.port}`))
  })
