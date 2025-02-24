module.exports = {
  definition: async function (db, DataTypes) {
    db.define("todos", {
      title: DataTypes.STRING,
      completedAt: DataTypes.DATE,
    })
  },
}
