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

// GET ATM services by Identification
app.get("/api/atms/:id/services", async (req, res) => {
    try {
        const atm = await db
            .collection("ATMs")
            .findOne({ Identification: req.params.id }, { projection: { ATMServices: 1 } });
        res.json(atm.ATMServices || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ATMs with search functionality
app.get("/api/atms/search", async (req, res) => {
    try {
        const query = {}; // Construct query based on req.query parameters
        // Example: if (req.query.location) query['Location.TownName'] = req.query.location;
        const atms = await db.collection("ATMs").find(query).toArray();
        res.json(atms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// UPDATE FUNCTIONS
// UPDATE an ATM by Identification
app.put("/api/atms/:id", async (req, res) => {
    try {
        const updatedAtm = await db.collection("ATMs")
            .findOneAndUpdate(
                { Identification: req.params.id },
                { $set: req.body },
                { returnDocument: 'after' }
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
        const deletedAtm = await db.collection("ATMs")
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

// GET branch by Identification
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
