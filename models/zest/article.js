var slugify = require('slugify')

module.exports = {
  definition: async function (db, DataTypes) {
    db.define('articles', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('title', value)
          this.setDataValue('slug', slugify(value))
        }
      },
      subtitle: {
        type: DataTypes.STRING
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('slug', slugify(value))
        }
      },
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.articles.hasMany(db.models.tags)
    db.models.articles.hasMany(db.models.sections)

    // add scopes:
    db.models.articles.addScope('published', {
      where: {
        published: true
      }
    })

  //   await db.models.Article.create({
  //     name: 'test',
  //     section: [
  //       {
  //         name: 'introduction',
  //         text: '<p>this is a test introduction</p>'
  //       },
  //       {
  //         name: 'body',
  //         text: '<p>this is the test body</p>'
  //       },
  //       {
  //         name: 'conclusion',
  //         text: '<p>goodbye</p>'
  //       },
  //       {
  //         name: null,
  //         text: '<p>bogus</p>'
  //       },
  //     ]
  //   })
  }
}
