const installation = require("./installation.md")

module.exports = async function (db, debug = true) {
  // Check if target model exists before attempting to create records:


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
  await db.models.articles?.create({
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
  }, standardArticleInclude)

  await db.models.articles?.create({
    title: 'Getting Started',
    slug: 'start',
    sections: [
      {
        name: 'Basic Installation',
        text: installation
      }
    ],
    tags: [
      {name: 'documentation'},
      {name: 'zest'},
      {name: 'base'},
      {name: 'installation'},
    ]
  }, standardArticleInclude)
}
