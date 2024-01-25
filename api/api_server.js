const express = require("express");
const mongoose = require("mongoose");
const app = express();

// MongoDB URI
const uri =
  "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/NCR";

// Middleware
app.use(express.json());

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});

// ATM ENDPOINTS

// GET FUNCTIONS
// GET all ATMs
app.get("/api/atms", async (req, res) => {
  try {
    const atms = await db.collection("ATMs").find({}).toArray();
    console.log(atms);
    res.json(atms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ATM by Identification
app.get("/api/atms/:id", async (req, res) => {
  try {
    const atm = await db
      .collection("ATMs")
      .findOne({ Identification: req.params.id });
    console.log(atm);
    res.json(atm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE FUNCTIONS
// UPDATE an ATM by Identification
app.put("/api/atms/:id", async (req, res) => {
  try {
    const updatedAtm = await db
      .collection("ATMs")
      .findOneAndUpdate(
        { Identification: req.params.id },
        { $set: req.body },
        { returnDocument: "after" }
      );
    console.log(updatedAtm);
    res.json(updatedAtm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE FUNCTIONS
// DELETE an ATM by Identification
app.delete("/api/atms/:id", async (req, res) => {
  try {
    const deletedAtm = await db
      .collection("ATMs")
      .deleteOne({ Identification: req.params.id });
    if (deletedAtm.deletedCount === 0) {
      return res.status(404).json({ message: "ATM not found" });
    }
    console.log(deletedAtm);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST FUNCTIONS
// POST a new ATM
app.post("/api/atms", async (req, res) => {
  try {
    const newAtm = await db.collection("ATMs").insertOne(req.body);
    console.log(newAtm);
    res.status(201).json(newAtm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BRANCH ENDPOINTS

// GET FUNCTIONS
// GET all Branches
app.get("/api/branches", async (req, res) => {
  try {
    const branches = await db.collection("Branches").find({}).toArray();
    console.log(branches);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch by Identification
app.get("/api/branches/:id", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne({ Identification: req.params.id });
    console.log(branch);
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE FUNCTIONS
// UPDATE a Branch by Identification
app.put("/api/branches/:id", async (req, res) => {
  try {
    const updatedBranch = await db
      .collection("Branches")
      .findOneAndUpdate(
        { Identification: req.params.id },
        { $set: req.body },
        { returnDocument: "after" }
      );
    console.log(updatedBranch);
    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE FUNCTIONS
// DELETE a Branch by Identification
app.delete("/api/branches/:id", async (req, res) => {
  try {
    const deletedBranch = await db
      .collection("Branches")
      .deleteOne({ Identification: req.params.id });
    if (deletedBranch.deletedCount === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    console.log(deletedBranch);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST FUNCTIONS
// POST a new Branch
app.post("/api/branches", async (req, res) => {
  try {
    const newBranch = await db.collection("Branches").insertOne(req.body);
    console.log(newBranch);
    res.status(201).json(newBranch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Listen on the specified port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
