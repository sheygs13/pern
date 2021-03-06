const cors = require("cors");
const pool = require("./db");
const path = require("path");
const express = require("express");
const app = express();

// middleware - req.body
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "production") {
  // serve static content from the client build folder
  express.static(path.join(__dirname, "client/build"));
}

/* ROUTES */

// create a todo
app.post("/api/v1/todos", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return;
    const todo = await pool.query(
      "INSERT INTO pern (title) VALUES ($1) RETURNING *",
      [title]
    );
    const { rows } = todo;
    res.status(201).json(rows[0]);
  } catch ({ message }) {
    console.error(message);
  }
});

// get all todos
app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await pool.query("SELECT * FROM pern");
    const { rows } = todos;
    res.status(200).json(rows);
  } catch ({ message }) {
    console.error(message);
  }
});

// get a todo
app.get("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM pern WHERE id = $1", [id]);
    const { rows } = todo;
    if (!rows[0]) {
      return res
        .status(404)
        .json({ message: "todo with the given ID not found" });
    }
    res.status(200).json(rows[0]);
  } catch ({ message }) {
    console.error(message);
  }
});

// update a todo
app.put("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return;
    const updatedTodo = await pool.query(
      "UPDATE pern SET title = $1 WHERE id = $2 RETURNING *",
      [title, id]
    );
    const { rows } = updatedTodo;
    if (!rows[0]) {
      return res
        .status(404)
        .json({ message: "todo with the given ID not found" });
    }
    res.status(200).json(rows[0]);
  } catch ({ message }) {
    console.error(message);
  }
});

// delete a todo
app.delete("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query(
      "DELETE FROM pern WHERE id = $1 RETURNING *",
      [id]
    );
    const { rows } = todo;
    if (!rows[0]) {
      return res
        .status(404)
        .json({ message: "todo with the given ID not found" });
    }
    res.status(204).json({ message: "todo deleted" });
  } catch ({ message }) {
    console.error(message);
  }
});

// return the main page for any incorrect route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}...`));
