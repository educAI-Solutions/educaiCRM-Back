const express = require("express");
const router = express.Router();

// Sample data (replace with your actual data storage logic)
let data = [
  { id: 1, name: "Item 1", description: "Description 1" },
  { id: 2, name: "Item 2", description: "Description 2" },
  { id: 3, name: "Item 3", description: "Description 3" },
];

// GET /api/data
router.get("/", (req, res) => {
  res.status(200).json(data);
});

// GET /api/data/:id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = data.find((item) => item.id === id);
  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// POST /api/data
router.post("/", (req, res) => {
  const newItem = req.body;
  data.push(newItem);
  res.status(201).json({ message: "Item added successfully", item: newItem });
});

// PUT /api/data/:id
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedItem = req.body;
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedItem };
    res
      .status(200)
      .json({ message: "Item updated successfully", item: data[index] });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// DELETE /api/data/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data.splice(index, 1);
    res.status(200).json({ message: "Item deleted successfully" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

module.exports = router;
