module.exports = {
  definition: async function (db, DataTypes) {
    db.define("todos", {
      title: DataTypes.STRING,
      completed: DataTypes.BOOLEAN,
      completedDate: DataTypes.DATE,
    })
  },
}
