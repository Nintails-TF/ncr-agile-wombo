require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./database'); // Assuming you have this module for DB connection
const routes = require('./routes');

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

// Use the routes defined in routes.js
app.use('/', routes);

// Creating end points for /api/atms/filter
app.get("/atms/filter", async (req, res) => {
  try {
    // fetching ATM filters from API and returning as JSON
    const data = await fetchFromAPI("atms/filter", req.query);
    res.json(data);
  } catch (error) {
    // error handling for fetch operations
    res.status(500).send("Error processing request");
  }
});

// Creating end points for /api/branches/filter
app.get("/branches/filter", async (req, res) => {
  try {
    // fetching branch filters from API and returning as JSON
    const data = await fetchFromAPI("atms/filter", req.query);
    res.json(data);
  } catch (error) {
    // error handling for fetch operations
    res.status(500).send("Error processing request");
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
