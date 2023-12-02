const Page = require('../index')

module.exports = class extends Page {
  /**
   * Force authentication to these pages
   */
  // authenticate = true
  menuItems = [
    {
      title: 'Introduction', 
      children: [ 
        {
          title: 'Why Zest?',
          id: 'why',
          link: '/docs/introduction/why'
        },
        {
          title: 'Philosophy', 
          link: '/docs/introduction/philosophy'
        }
      ]
    },
    {
      title: 'Start',
      children: [
        {
          title: 'Installation',
          link: '/docs/start#installation'
        },
        {
          title: 'Running',
          link: '/docs/start#running'
        },
        {
          title: 'Developing',
          link: '/docs/start#developing'
        }
      ]
    },
    {
      title: 'Examples', 
      children: [
        {
          title: 'Blog',
          link: '/docs/examples#blog'
        },
        {
          title: 'Project',
          link: '/docs/examples#project'
        },
        {
          title: 'Dashboard',
          link: '/docs/examples#dashboard'
        },
        {
          title: 'CRUD App',
          id: 'crud-app',
          link: '/docs/examples#crud'
        }
      ]
    },
    {
      title: 'Concepts',
      children: [
        {
          title: 'Routes',
          link: '/docs/concepts#routes'
        },
        {
          title: 'Inheritance',
          link: '/docs/concepts#inheritance'
        },
        {
          title: 'Partials',
          link: '/docs/concepts#partials'
        },
        {
          title: 'Configuration',
          link: '/docs/concepts#partials'
        }
      ]
    },
    {
      title: 'Deployment', 
      children: [
        {
          title: 'AWS',
          link: '/docs/deployment#aws'
        },
        {
          title: 'Google Cloud',
          id: 'gcloud',
          link: '/docs/deployment#gcloud'
        },
        {
          title: 'Fly.io',
          id: 'flyio',
          link: '/docs/deployment#flyio'
        }
      ]
    }
  ]

  sidebar = /* html */ `
    <!-- Sidebar -->
    <aside id="documentation-sidebar" class="menu">
      <ul class="menu-list">
        {{mainMenu}}
      </ul>
    </aside>
    <!-- End Sidebar -->
  `

  altSidebar = (req, res) => {
    if (!this.articles[0]) return '<div class="error">no sections found</div>'
    return /* html */ `
      <!-- AltSidebar -->
      <aside id="documentation-sections" class="document-menu">
        <ul class="menu-list">
          {{articleSectionsMenu}}
        </ul>
      </aside>
      <!-- End AltSidebar -->
    `
  }

  // We override body to account for the new nav components
  body = /* html */ `
    <div class="documentation-layout">
      {{mainNav}}
      <div class="sidebar">
        {{sidebar}}
      </div>
      <div id="document-container" class="article">
        {{main}}
      </div>
      <div class="alt-sidebar">
        {{altSidebar}}
      </div>
      {{footer}}
    </div>
  `

  main = /* html */ `
  {{articleTitle}}
  {{articleSubtitle}}
  <div class="meta">
    {{articleMetaData}}
    {{articleTags}}
  </div>
  {{articleSections}}
  `

  articleTitle = (req, res) => {
    return `<h1 class="title">${this.articles[0].title}</h1>`
  }

  articleSubtitle = (req, res) => {
    if (this.articles[0].subtitle) return `<h2 class="subtitle">${this.articles[0].subtitle}</h2>`
    return ''
  }

  articleMetaData = (req, res) => {
    return `<div class="updated-at">${this.articles[0].updatedAt}</div>`
  }

  articleTags = (req, res) => {
    if (this.articles[0].tags.length) {
      return this.articles[0].tags.reduce((tagString, tag) => {
        return `${tagString}<div class="tag">${tag.name}</div>`
      }, '')
    }
    return ''
  }

  articleSections = (req, res) => {
    return this.articles[0].sections.reduce((sectionString, section) => {
      return `${sectionString}
      <h3 id="${this.articles[0].slug}-${section.anchor}"class="is-size-3">${section.name}</h3>
      <div class="article-section-body">
      ${section.text}
      </div>
      `
    }, '')
  }

  articleSectionsMenu = (req, res) => {
    if (!this.articles[0]) return 
    return this.articles[0].sections.reduce((sectionString, section) => {
      return `${sectionString}<a href="#${this.articles[0].slug}-${section.anchor}">${section.name}</a>`
    }, '')
  }

  async _get (req, res, next) {
    const fetchArticlesSearchObj = {
      where: {},
      limit: res.locals.limit,
      offset: res.locals.page,
      order: [
        ['createdAt', 'DESC']
      ]
    }
  
    // this.pathParams = this.parsePathParams(req, res, __dirname)
    console.debug(`PATHPARAMS: \t\t${JSON.stringify(res.locals.pathParams)}`)
    
    fetchArticlesSearchObj.include = [
      req.app.locals.db.zest.models.sections,
      req.app.locals.db.zest.models.tags
    ]

    if (!res.locals.pathParams.length) {
      fetchArticlesSearchObj.where.slug = 'Zest-Home'
    } else {
      console.debug(`NAME: ${res.locals.pathParams[0]}`)
      fetchArticlesSearchObj.where.slug = res.locals.pathParams[0]
    }

    this.articles = await this.fetchArticlesSearch(res, fetchArticlesSearchObj)

    if (!this.articles.length) this.main = '<div class="error">no article found</div>'

    super._get(req, res, next)
  }
  
  async index (res) {
  }
  
  async show (res, articleName) {
  }
  
  async fetchArticlesSearch (res, searchCriteria) {
    return await res.app.locals.db.zest.models.articles?.findAll(searchCriteria)
    // return await res.app.locals.db.start.models.articles.findAll(searchCriteria)
  }
}
