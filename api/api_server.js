const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

// Schemas
const { ATM, Branch } = require("./schemas");

// MongoDB URI
const uri =
  "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority";

// Middleware
app.use(express.json());

mongoose.connect(uri);

const db = mongoose.connection;

// API Endpoints
app.get("/", (req, res) => res.send("Hello World!"));

// ATM ENDPOINTS

// Get all ATMS
app.get("/atms", async (req, res) => {
  try {
    const atms = await ATM.find({});
    res.json(atms);
  } catch (error) {
    res.status(500).send(error);
  }
});

// BRANCH ENDPOINTS

// Get all Branches
app.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Listen on the specified port
app.listen(port, () => console.log(`API server listening on port ${port}!`));
