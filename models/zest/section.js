var slugify = require('slugify')

module.exports = {
  definition: async function (db, DataTypes) {
    console.log('  applying definition for Sections...')
    db.define('sections', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('name', value)
          this.setDataValue('anchor', slugify(value))
        }
      },
      anchor: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('anchor', slugify(value))
        }
      },
      type: {
        type: DataTypes.STRING,
        default: 'HTML'
      },
      text: DataTypes.TEXT
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.sections.belongsTo(db.models.articles)
  }
}
