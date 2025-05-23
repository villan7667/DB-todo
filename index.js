// Modern Todo List App
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")

const PORT = process.env.PORT || 3000

const app = express()

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.use(
  session({
    secret: "yourSecretKey123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  }),
)

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://hsgf7667:villan7667@cluster7667.h95hy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7667"

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ["urgent", "high", "low"], default: "low" },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const Task = mongoose.model("Task", taskSchema)

// Home route
app.get("/", async (req, res) => {
  try {
    // Sort tasks: incomplete tasks first (completed: false), then completed tasks (completed: true)
    // Within each group, sort by creation date (newest first)
    const tasks = await Task.find().sort({
      completed: 1, // incomplete (false) first, completed (true) last
      createdAt: -1, // newest first within each group
    })
    const alert = req.session.alert || null
    req.session.alert = null // Clear after use
    res.render("list", { tasks, alert })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    req.session.alert = { type: "error", message: "Failed to load tasks" }
    res.render("list", { tasks: [], alert: req.session.alert })
  }
})

// Add Task
app.post("/", async (req, res) => {
  try {
    const title = req.body.taskTitle.trim()
    const priority = req.body.taskPriority

    if (!title) {
      req.session.alert = { type: "error", message: "Task title cannot be empty!" }
      return res.redirect("/")
    }

    await Task.create({ title, priority })
    req.session.alert = { type: "success", message: "Task added successfully!" }
    res.redirect("/")
  } catch (error) {
    console.error("Error adding task:", error)
    req.session.alert = { type: "error", message: "Failed to add task" }
    res.redirect("/")
  }
})

// Delete Task
app.post("/delete", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.body.taskId)
    req.session.alert = { type: "success", message: "Task deleted successfully!" }
    res.redirect("/")
  } catch (error) {
    console.error("Error deleting task:", error)
    req.session.alert = { type: "error", message: "Failed to delete task" }
    res.redirect("/")
  }
})

// Edit Task
app.post("/edit", async (req, res) => {
  try {
    const { taskId, updatedTitle, updatedPriority } = req.body

    if (!updatedTitle.trim()) {
      req.session.alert = { type: "error", message: "Task title cannot be empty!" }
      return res.redirect("/")
    }

    await Task.findByIdAndUpdate(taskId, {
      title: updatedTitle.trim(),
      priority: updatedPriority,
    })

    req.session.alert = { type: "success", message: "Task updated successfully!" }
    res.redirect("/")
  } catch (error) {
    console.error("Error updating task:", error)
    req.session.alert = { type: "error", message: "Failed to update task" }
    res.redirect("/")
  }
})

// Toggle task completion
app.post("/toggle", async (req, res) => {
  try {
    const task = await Task.findById(req.body.taskId)
    task.completed = !task.completed
    await task.save()

    res.json({ success: true, completed: task.completed })
  } catch (error) {
    console.error("Error toggling task:", error)
    res.status(500).json({ success: false, error: "Failed to toggle task" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`)
})
