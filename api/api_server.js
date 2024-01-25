const express = require("express");
const mongoose = require("mongoose");
const atmRoutes = require('./atmRoutes'); // Import ATM routes
const branchRoutes = require('./branchRoutes'); // Import Branch routes
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

// Use the imported routes
app.use(atmRoutes);
app.use(branchRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Listen on the specified port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
