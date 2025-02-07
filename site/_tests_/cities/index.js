const Page = require('../index')

module.exports = class extends Page {
  /**
   * modelIndex of the element in res.locals.requestParams the represents the 
   * model name. For example, the res.locals.requestParams for this responder
   * is going to be ["_tests_","cities"]. This is simply because of the 
   * positioning of the responder file in the site tree.
   * 
   * modelIndex is 1 - element 1 in the requestParams array = "cities"
   * 
   * This value ("cities") is assigned to res.locals.model.
   */
  modelIndex = 1

  /**
   * instanceIndex represents where the instance of the model can be found in
   * res.locals.requestParams.
   * 
   * So, if this responder responds to a GET request of /_tests_/cities/3 then
   * the following would be the case:
   * 
   *  - res.locals.requestParams would be: ["_tests_","cities", "3"]
   *  - instanceIndex is 2
   *  - the instance number is therefore in position 2 of the res.locals.requestParams: "3"  
   */
  instanceIndex = 2

  addOn = /* html */ `
    <div id="addOn">Major Cities</div>
    {{list}}
  `

  cities = [
    'New York',
    'Barcelona',
    'Tel Aviv',
    'Los Angeles',
    'Bankok'
  ]

  list = (_req, res) => {
    const items = this[res.locals.model].reduce((acc, item) => `${acc}<li id="${item}">${item}</li>`, '')
    return `<ol>${items}</ol>`
  } 

  unorderedList = (_req, res) => {
    const items = this[res.locals.model].reduce((acc, item) => `${acc}<li id="${item}">${item}</li>`, '')
    return `<ul>${items}</ul>`
  } 
}
