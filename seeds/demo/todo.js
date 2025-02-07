module.exports = async function (db, debug = true) {
  await db.models.todos?.create({
    title: "Learn Zest",
    completed: false,
  })
  await db.models.todos?.create({
    title: "Write my first Zest app",
    completed: false,
  })
  await db.models.todos?.create({
    title: "Take a nap",
    completed: true,
  })
}
