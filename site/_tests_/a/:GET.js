const Page = require('../clone')

module.exports = class extends Page {
  listOfThings = [
    'car',
    'boat',
    'airplane',
    'train'
  ]

  list = () => {
    const items = this.listOfThings.reduce((acc, item) => `${acc}<li id="${item}">${item}</li>`, '')
    return `<ol>${items}</ol>`
  } 

  unorderedList = () => {
    const items = this.listOfThings.reduce((acc, item) => `${acc}<li id="${item}">${item}</li>`, '')
    return `<ul>${items}</ul>`
  } 
}
