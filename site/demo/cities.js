/**
 * We're going to inherit the settings from the ./index.js page,
 * which inherits from the Zest base Page class.
 *
 * Since we inherit from ./index, all we have to do is modify
 * the pieces that we need to change
 */
const Page = require("./index")

module.exports = class extends Page {
  /**
   * Besides directly assigning the DB and model name, you can specify the
   * positions in the file's path that designate the model.
   *
   * Use:
   *  - modelIndex: to define the position in this file's path to designate
   * the modelname
   *  - instanceIndex: to define the position in this file's path that determine
   * the value of the instance keys
   *
   * For example, we're here in the /demo/cities.js file. That path gets broken
   * into individual elements: ["demo", "cities"]
   *
   * Since this is the case, we can designate that modelIndex = 1. That index
   * of 1 corresponds to "cities" in the above array.
   *
   * Zest will use that value ("cities") to try to find a matching table in the
   * databse.
   *
   * Here, we revert the way we demonstrated in the inherited page: ./index.js
   */
  modelSetup = Page.prototype.modelSetup

  /**
   * ...and then we set up the model index to 1, rather than 0
   * 0 would make Zets pull 'demo' from /demo/cities and 'demo' isn't
   * a table name.
   */
  modelIndex = 1

  /**
   * This function, called 'cities' is referenced in the 'main' block, below.
   *
   * 'cities' is a function that returns a string of HTML.
   *
   * We can reference these functions directly in the URL like this:
   *
   * ```
   * /demo/cities?_fragment=cities
   * ```
   *
   * This would return _just_ the output of this function.
   *
   * So, you could define a bunch of different functions that output fragments
   * and, with the right _fragment value, this page will output different
   * 'views' of the same data.
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  citiesList = (req, res) => {
    const output = req.app.locals.model.reduce((listOfCities, city) => {
      return (
        listOfCities +
        `<li><a href="/demo/cities/${city.id}">${city.name}</a> ${city.population}</li>`
      )
    }, "<ul>")
    return `${output}</ul>`
  }

  cityRecord = (req, res) => {
    const city = req.app.locals.model[0]
    return `
      <div>
        <div id="city-name">${city.name}</div>
        <div id="city-population">Population: ${city.population}</div>
        <div id="city-location">${city.latitude}, ${city.longitude}</div>
        <div id="city-picture">${city.picture}</div>
      </div>
    `
  }

  /**
   * The modelSearchParams object is a thing that this page uses to search
   * the model table for the required records.
   *
   * See: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#applying-where-clauses
   *
   * for more documentation on this.
   *
   * Here, we order the query alphabetically, by name.
   *
   * But we don't have to do it here. We could always take the result and use
   * array.sort() but this way is easier.
   */
  modelSearchParams = {
    where: {},
    order: [["name", "ASC"]],
  }

  main = /* html */ `
    <section class="hero is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-1 has-text-centered">{{appTitle}}</h1>
          <p class="subtitle has-text-centered">{{tagLine}}</p>
          <div>
            {{cities}}
          <div>
          <div class="container has-text-centered">
            <a class="button is-primary" href="/docs/get-started"><strong>Get started</strong></a>
            <a class="button is-light" href="/docs">Learn more</a>
          </div>
        </div>
      </div>
    </section>
  `

  cities = (req, res) => {
    if (res.locals.instance) {
      return `{{cityRecord}}`
    }
    return `{{citiesList}}`
  }

  mainMenu = (req, res) => {
    const makeMenu = menuItems => {
      return menuItems
        .map(menuItem => {
          res.app.locals.debug && console.debug(`\t*** ${req.path}`)
          if (menuItem.hr) {
            return /* html */ `<hr>`
          }
          if (!menuItem.auth || (menuItem.auth && res.locals.authenticated)) {
            if (menuItem.children) {
              return /* html */ `
            <li>
              <a>${menuItem.title}</a>
              <ul>
                ${makeMenu(menuItem.children)}
              </ul>
            </li>
            `
            } else {
              return /* html */ `
            <li>
              <a href="${menuItem.link}">${menuItem.title}</a>
            </li>
            `
            }
          }
        })
        .join("")
    }

    return /* html */ `
      ${makeMenu(this.menuItems)}
    `
  }

  footer = /* html */ `
    <footer class="footer">
      <div class="container">
        <div class="columns">
          <div class="column">
            {{appTitle}} - {{tagLine}}
          </div>
          <div class="column">
            <ul class="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:mt-0 lg:justify-end lg:gap-12">
              <li>
                <a class="text-gray-700 transition hover:text-gray-700/75" href="/">Home</a>
              </li>
              <li>
                <a class="text-gray-700 transition hover:text-gray-700/75" href="/docs">Documentation</a>
              </li>
              <li>
                <a class="text-gray-700 transition hover:text-gray-700/75" href="/examples">Examples</a>
              </li>
              <li>
                <a class="text-gray-700 transition hover:text-gray-700/75" href="/blog">Blog</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `

  pagination = (req, res) => {
    return /* html */ `<div class="pagination">{{paginationPrev}}${
      res.locals.page + 1
    }{{paginationNext}}</div>`
  }

  paginationPrev = (req, res) => {
    return res.locals.page
      ? /* html */ `<div><a href="${req.path}?page=${
          res.locals.page - 1
        }">prev</a></div>`
      : ""
  }

  paginationNext = (req, res) => {
    return /* html */ `<div><a href="${req.path}?page=${
      res.locals.page + 1
    }">next</a></div>`
  }

  simpleLocalDate = dateString => {
    const d = new Date(Date.parse(dateString))
    return d.toLocaleDateString()
  }
}
