module.exports = {
  definition: async function (db, DataTypes) {
    db.define('addresses', {
      house: DataTypes.STRING,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      postalCode: DataTypes.STRING
    })
  },
  postDefinition: async function (db, DataTypes, Op) {
    db.models.addresses.belongsTo(db.models.owners)
  }
}
