module.exports = {
  definition: async function (db, DataTypes) {
    db.define('tags', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.tags.belongsTo(db.models.articles)
  }
}
