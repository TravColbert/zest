module.exports = {
  definition: async function (db, DataTypes) {
    db.define('pets', {
      name: DataTypes.STRING
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.pets.belongsTo(db.models.owners)
  }
}
