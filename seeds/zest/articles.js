const { readFile } = require('fs/promises')
const path = require('path')

const loadFile = async(filePath) => {
  try {
    return await readFile(path.join(__dirname, filePath), { encoding: 'utf8' })
  } catch (err) {
    console.error(err.message)
    return ""
  }
}

module.exports = async function (db, debug = true) {
  const articleConfigs = [
    {
      title: 'Zest Home',
      subtitle: 'Zest - a refreshing way to build performant web apps',
      sections: [
        {
          name: 'Introduction',
          text: `
          <p>Welcome to the Zest documentation</p>
          <p>We think Zest is great and we believe you'll feel the same way too.</p>
          `
        }
      ],
      tags: [
        {name: 'documentation'},
        {name: 'zest'},
        {name: 'base'},
      ]
    },
    {
      title: 'Getting Started',
      slug: 'start',
      sections: [
        {
          name: 'Basic Installation',
          text: await loadFile('installation.html')
        }
      ],
      tags: [
        {name: 'documentation'},
        {name: 'zest'},
        {name: 'base'},
        {name: 'installation'},
      ]
    }
  ]

  /**
   * This include block is used in all seeds in this file.
   * 
   * It allows us to eager-load the relatons: sections and tags
   */
  const standardArticleInclude = {
    include: [
      db.models.sections,
      db.models.tags
    ]
  }
  
  let articleQueue = articleConfigs.map((articleConfig) => {
    return async () => {
      console.debug("\n\t\tINSERTING ARTICLE\n")
      await db.models.articles?.create(articleConfig, standardArticleInclude)
    }
  })

  // TODO: Not sure why this doesn't work:
  // await Promise.all(articleQueue)

  articleQueue.forEach(async articleFunction => {
    await articleFunction()
  })
}
