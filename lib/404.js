module.exports = (req, res, next) => {
  const message = `cannot process: ${req.originalUrl}`
  console.info(message)
  req.endDate = new Date()
  const duration = req.endDate - req.startDate
  console.log(`\t\tresponse code? ${res.app.locals.noResponseCodes}`)
  res.app.locals.noResponseCodes || res.status(404)
  res.send(message)
  console.log(`completed:\t${duration} ms`)
}
