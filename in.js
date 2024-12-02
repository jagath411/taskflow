const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("TaskFlow API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// const tasksFile = "../tasks.json";

const path = require("path");
const tasksFile = path.resolve(__dirname, "./tasks.json");

let tasks = [];
let lastId = 0;

// if (fs.existsSync(tasksFile)) {
//   tasks = JSON.parse(fs.readFileSync(tasksFile));
// }

if (fs.existsSync(tasksFile)) {
  tasks = JSON.parse(fs.readFileSync(tasksFile));
  if (tasks.length > 0) {
    lastId = Math.max(...tasks.map((task) => task.id)); // Find the highest ID
  }
} else {
  lastId = 0;
}
const { v4: uuidv4 } = require("uuid");

app.post("/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }

  //   const newTask = {
  //     id: uuidv4(),
  //     title,
  //     description,
  //     status: "pending",
  //   };

  const newTask = {
    id: 32,
    title,
    description,
    status: "pending",
  };

  tasks.push(newTask);

  fs.writeFileSync(tasksFile, JSON.stringify(tasks));

  res.status(201).json({ message: "Task created successfully", task: newTask });
});

app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (status !== "pending" && status !== "completed") {
    return res.status(400).json({ error: "Invalid status value" });
  }

  task.status = status;

  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

  res.status(201).json({ message: "Task created successfully", task: newTask });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);

  // Save tasks to file (Bonus)
  fs.writeFileSync(tasksFile, JSON.stringify(tasks));

  res.status(200).json({ message: "Task deleted successfully" });
});

app.get("/tasks/status/:status", (req, res) => {
  const { status } = req.params;

  if (status !== "pending" && status !== "completed") {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const filteredTasks = tasks.filter((t) => t.status === status);
  res.status(200).json(filteredTasks);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
