const Page = require('../lib/Page')

module.exports = class extends Page {
  linksTop = /* html */ `
  <link rel="stylesheet" href="/css/zest.css">
  `

  metaTop = /* html */ `
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="cyan" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="black" />
  `

  htmlClasses = 'has-navbar-fixed-top'

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

  tagLine = `Effortlessly build performant web applications using native web practices`

  // Clear sidebar
  sidebar = /* html */ ''

  // Clear altSidebar
  altSidebar = /* html */ ''

  main = /* html */ `
    <section class="hero is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-size-1 has-text-centered">{{appTitle}}</h1>
          <p class="subtitle has-text-centered">{{tagLine}}</p>
          <div class="container has-text-centered">
            <a class="button is-primary" href="/docs/get-started"><strong>Get started</strong></a>
            <a class="button is-light" href="/docs">Learn more</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="block">
          <h2 class="is-size-2 has-text-centered">Why you will &#10084; Zest</h2>
          <p class="has-text-centered">Zest is a refreshingly different &mdash; yet simple &mdash; way to build highly performant web applications. You will discover that these key features will transform how you build.</p>
        </div>
        <div class="block columns">
          <div class="column">
            <div class="card is-shadowless">
              <header class="card-header is-shadowless">
                <h3 class="card-header-title is-centered is-size-4">Web-Standards</h3>
              </header>
              <div class="card-content">
                <p>Zest leverages the same web standards that have worked for decades. Zest will feel immediately familiar.</p>
              </div>
              <div class="card-footer">
                <a>Learn More</a>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="card is-shadowless">
              <header class="card-header is-shadowless">
                <h3 class="card-header-title is-centered is-size-4">Simple</h3>
              </header>
              <div class="card-content">
                <p>Zest does not invent new ways of delivering web pages to your browser. There are no complicated layers to learn.</p>
              </div>
              <div class="card-footer">
                <a>Learn More</a>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="card is-shadowless">
              <header class="card-header is-shadowless">
                <h3 class="card-header-title is-centered is-size-4">Fast and Light</h3>
              </header>
              <div class="card-content">
                <p>Because Zest is simple it is fast and light. No compilations or transpilations. Build full web applications in under 10K.</p>
              </div>
              <div class="card-footer">
                <a>Learn More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `

  mainMenu = (req, res) => {
    const makeMenu = (menuItems) => {
      return menuItems.map(menuItem => {
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
      }).join('')
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
            {{appTitle}}
            {{tagLine}}
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
    return /* html */ `<div class="pagination">{{paginationPrev}}${res.locals.page + 1}{{paginationNext}}</div>`
  }

  paginationPrev = (req, res) => {
    return (res.locals.page) ? /* html */ `<div><a href="${req.path}?page=${res.locals.page - 1}">prev</a></div>` : ''
  }

  paginationNext = (req, res) => {
    return /* html */ `<div><a href="${req.path}?page=${res.locals.page + 1}">next</a></div>`
  }

  simpleLocalDate = (dateString) => {
    const d = new Date(Date.parse(dateString))
    return d.toLocaleDateString()
  }
}
