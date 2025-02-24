module.exports = async function (db) {
  /**
   * These probably should be just:
   *  - await db.create({ 
   *      title: "Learn Zest", 
   *      completed: false 
   *    })
   */
  await db.models.todos?.create({
    title: "Learn Zest",
    completedAt: null,
  })
  await db.models.todos?.create({
    title: "Write my first Zest app",
    completedAt: null,
  })
  // completedAt is the current date-time
  await db.models.todos?.create({
    title: "Take a nap",
    completedAt: Date.now()
  })
}
