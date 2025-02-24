const Page = require("../../lib/Page")

module.exports = class extends Page {
  linksTop = /* html */ `
    <link rel="stylesheet" href="/css/zest.css">
    <link rel="stylesheet" href="/css/normalize.css">
  `

  metaTop = /* html */ `
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="cyan" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="black" />
  `

  htmlClasses = "has-navbar-fixed-top"

  body = /* html */ `
    {{mainNav}}
    {{sidebar}}
    {{main}}
    {{altSidebar}}
    {{footer}}
  `

  mainNav = /* html */ `
    <nav class="header navbar is-fixed-top" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="/">{{appTitle}}</a>
        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="mainMenu" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="/docs/why">Why Zest?</a>
          <a class="navbar-item" href="/docs/get-started">Get started</a>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">More</a>
            <div class="navbar-dropdown">
              <a class="navbar-item">Documentation</a>
              <a class="navbar-item">Examples</a>
              <a class="navbar-item">Blog</a>
              <hr class="navbar-divider">
              <a class="navbar-item">Report an issue</a>
            </div>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            {{authenticationButtons}}
          </div>
        </div>
      </div>
    </nav>
  `

  authenticationButtons = (req, res) => {
    if (res.locals.authenticated) {
      return /* html */ `
        <a href="/logout" class="button is-light">Log out</a>      
      `
    }
    return /* html */ `
      <a class="button is-primary"><strong>Sign up</strong></a>
      <a href="/login" class="button is-light">Log in</a>
    `
  }

  tagLine = `What needs to be done?`

  // Clear sidebar
  sidebar = /* html */ ""

  // Clear altSidebar
  altSidebar = /* html */ ""

  /**
   * We define the database name and table name where we expect the
   * (super) _GET function to find the names of the todos`.
   *
   * If this file was named /demo/todos, then Zest would have figured
   * it out throught the file name and path alone.
   *
   * Since this javascript's name does not match the name of the table
   * it mainly references, we provide the name of the DB and the table.
   */
  modelSetup = () => ["demo", "todos"]

  itemsLeftCounter = (req, res) => {
    const todosCount = req.app.locals.model.filter(todo => {
      return todo.completed != true
    }).length

    return `${todosCount} item${todosCount === 1 ? "" : "s"} left`
  }

  todos = (req, res) => {
    /**
     * We're using the built-in (super) _GET responder. It populates
     * the todos in req.app.locals.model.
     *
     * You can iterate over req.app.locals.model to manage the todos.
     *
     * Here, we create a checkbox and label for each todo.
     */
    return req.app.locals.model
      .map(todo => {
        return `
          <div>
            <input 
              type="checkbox" 
              id="todo-${todo.id}" 
              name="completed" 
              value="true" 
              ${todo.completed ? "checked" : ""}
              hx-patch="/demo/${todo.id}?_fragment=todoForm"
              hx-target="#todo-form-container"
            >
            <label for="todo-${todo.id}">${todo.title}</label>
          </div>`
      })
      .join("")
  }

  /**
   * The 'main' block refers to a remplate called 'todoForm'
   *
   * Template blocks can either be am HTML string or a function that
   * returns an HTML string.
   */
  todoForm = /* html */ `
      <input 
        type="text" 
        id="title" 
        name="title" 
        placeholder="What needs to be done?" 
        hx-post="/demo?_fragment=todoForm" 
        hx-target="#todo-form-container"
      />
      {{todos}}
      <div>
        {{itemsLeftCounter}}
      </div>
    `

  main = /* html */ `
    <section class="hero is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-1 has-text-centered">{{appTitle}}</h1>
          <p class="subtitle has-text-centered">{{tagLine}}</p>
          <div id="todo-form-container">
            {{todoForm}}
          <div>
          <div class="container has-text-centered">
            <a class="button is-primary" href="/docs/get-started"><strong>Get started</strong></a>
            <a class="button is-light" href="/docs">Learn more</a>
          </div>
        </div>
      </div>
    </section>
  `

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
    return /* html */ `<div class="pagination">{{paginationPrev}}${res.locals.page + 1
      }{{paginationNext}}</div>`
  }

  paginationPrev = (req, res) => {
    return res.locals.page
      ? /* html */ `<div><a href="${req.path}?page=${res.locals.page - 1
      }">prev</a></div>`
      : ""
  }

  paginationNext = (req, res) => {
    return /* html */ `<div><a href="${req.path}?page=${res.locals.page + 1
      }">next</a></div>`
  }

  simpleLocalDate = dateString => {
    const d = new Date(Date.parse(dateString))
    return d.toLocaleDateString()
  }
}
