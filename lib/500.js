const _500 = (err = 'server error') => {
  return `<pre>${err}<pre>`
}

module.exports = (err, req, res) => {
  console.error(err.stack)
  res.status(500).send(_500(err))
}
