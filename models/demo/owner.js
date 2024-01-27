module.exports = {
  definition: async function (db, DataTypes) {
    db.define('owners', {
      name: DataTypes.STRING
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.owners.hasMany(db.models.pets)
    db.models.owners.hasOne(db.models.addresses)
  }
}
