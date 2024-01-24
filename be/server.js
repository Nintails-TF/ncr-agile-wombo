const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose"); // Ensure mongoose is required if you're using it
const app = express();

// Basic Route
app.get('/', (req, res) => res.send('Hello World!'));

if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB without deprecated options
  mongoose.connect(
    "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Function to retrieve data from an endpoint
async function fetchFromAPI(endpoint, params) {
  try {
    // Query the API for the data
    const response = await axios.get(
      `https://wombo-412213.nw.r.appspot.com/api/${endpoint}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Backend endpoint for getting branches from API
app.get("/branches", async (req, res) => {
  try {
    // Call the function to fetch data from API
    const data = await fetchFromAPI("branches", req.query);
    res.json(data);
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

module.exports = app;
