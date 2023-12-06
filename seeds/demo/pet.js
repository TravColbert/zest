module.exports = async function (db, debug = true) {
  await db.models.pets?.create({name: "Fido"})
  await db.models.pets?.create({name: "Spot"})
  await db.models.pets?.create({name: "Fluffy"})
}
