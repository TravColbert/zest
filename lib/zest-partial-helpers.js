const getModelColumns = (model) => {
  if (model && model.length) {
    const record = model[0]
    return Object.keys(record.get())
  }
  return false
}

module.exports = {
  modelTableHeader : (req, options = {}) => {
    let recordColumns = getModelColumns(req.app.locals.model)

    if (options.hasOwnProperty('addActions') && options.addActions) recordColumns.push('actions')

    if (!recordColumns) return ''

    let headerString = recordColumns.reduce((acc, column) => {
      return `${acc}<th>${column}</th>`
    }, '')

    return `<thead><tr>${headerString}</tr></thead>`
  },

  modelTableBody : (req, options = {}) => {
    let recordColumns = getModelColumns(req.app.locals.model)
    
    if (options.hasOwnProperty('addActions') && options.addActions) {
      recordColumns.push('actions')
    }

    if (!recordColumns) return ''

    let returnString = req.app.locals.model.reduce((rowString, record) => {
      rowString += `<tr id="${req.app.locals.modelName}_${record.id}">`
      for (const column of recordColumns) {
        let columnId = `${req.app.locals.modelName}_${record.id}_${column}`
        if (column === "id") {
          const recordId = record.get(column)
          rowString += `<td id="${columnId}"><a href="/${req.app.locals.modelName}/${recordId}">${recordId}</a></td>`
        } else if (column === "actions") {
          rowString += `<td id="${columnId}">edit delete</td>`
        } else {
          rowString += `<td id="${columnId}">${record.get(column)}</td>`
        }
      }
      rowString += `</tr>`
      return rowString
    }, '<tbody>')

    return `${returnString}</tbody>`
  }
}