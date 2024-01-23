const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

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

const ObjectId = require('mongodb').ObjectId;

// ATM ENDPOINTS
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

// GET ATM by _id
app.get("/api/atms/:id", async (req, res) => {
    try {
        const atm = await db
            .collection("ATMs")
            .findOne({ _id: new ObjectId(req.params.id) });
        console.log(atm);
        res.json(atm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE an ATM by _id
app.put("/api/atms/:id", async (req, res) => {
    try {
        const updatedAtm = await db.collection("ATMs")
            .findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body },
                { returnDocument: 'after' }
            );
        console.log(updatedAtm);
        res.json(updatedAtm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE an ATM by _id
app.delete("/api/atms/:id", async (req, res) => {
    try {
        const deletedAtm = await db.collection("ATMs")
            .deleteOne({ _id: new ObjectId(req.params.id) });
        if (deletedAtm.deletedCount === 0) {
            return res.status(404).json({ message: "ATM not found" });
        }
        console.log(deletedAtm);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// BRANCH ENDPOINTS

// GET all branches
app.get("/api/branches", async (req, res) => {
  try {
    const branches = await db.collection("Branches").find({}).toArray();
    console.log(branches);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET branch by id
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

// Listen on the specified port
app.listen(port, () => console.log(`API server listening on port ${port}!`));
