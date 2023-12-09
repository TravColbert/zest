const getModelColumns = (model) => {
  if (model.length) {
    const record = model[0]
    return Object.keys(record.get())
  }
  return false
}

module.exports = {
  modelTableHeader : (model) => {
    const recordColumns = getModelColumns(model)
    
    if (!recordColumns) return ''

    let headerString = recordColumns.reduce((acc, column) => {
      return `${acc}<th>${column}</th>`
    }, '<thead><tr>')
    headerString += `</tr></thead>`

    return headerString
  },

  modelTableBody : (model) => {
    const recordColumns = getModelColumns(model)
    
    if (!recordColumns) return ''

    let returnString = model.reduce((rowString, record) => {
      rowString += `<tr>`
      for (const column of recordColumns) {
        if (column === "id") {

        }
        rowString += `<td>${record.get(column)}</td>`
      }
      rowString += `</tr>`
      return rowString
    }, '<tbody>')

    return `${returnString}</tbody>`
  }
}