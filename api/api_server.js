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

// GET Branch Accessibility by Identification
app.get("/api/branches/:id/accessibility", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { Accessibility: 1 } }
      );
    res.json(branch.Accessibility || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch ServiceAndFacility by Identification
app.get("/api/branches/:id/service_and_facility", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { ServiceAndFacility: 1 } }
      );
    res.json(branch.ServiceAndFacility || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch PostalAddress by Identification
app.get("/api/branches/:id/postal_address", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { PostalAddress: 1 } }
      );
    res.json(branch.PostalAddress || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch ContactInfo by Identification
app.get("/api/branches/:id/contact_info", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { ContactInfo: 1 } }
      );
    res.json(branch.ContactInfo || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch Availability by Identification
app.get("/api/branches/:id/availability", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { Availability: 1 } }
      );
    res.json(branch.Availability || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch CustomerSegment by Identification
app.get("/api/branches/:id/customer_segment", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { CustomerSegment: 1 } }
      );
    res.json(branch.CustomerSegment || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch Type by Identification
app.get("/api/branches/:id/type", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { Type: 1 } }
      );
    res.json(branch.Type || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch Name by Identification
app.get("/api/branches/:id/name", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { Name: 1 } }
      );
    res.json(branch.Name || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Branch SequenceNumber by Identification
app.get("/api/branches/:id/sequence_number", async (req, res) => {
  try {
    const branch = await db
      .collection("Branches")
      .findOne(
        { Identification: req.params.id },
        { projection: { SequenceNumber: 1 } }
      );
    res.json(branch.SequenceNumber || []);
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
