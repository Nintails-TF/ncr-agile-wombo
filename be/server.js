const express = require("express");
const axios = require("axios");
const app = express();

// function to retrieve data from an endpoint
async function fetchFromAPI(endpoint, params) {
  try {
    // query the API for the data
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

// backend endpoint for getting branches from API
app.get("/branches", async (req, res) => {
  try {
    // call the function to fetch data from API
    const data = await fetchFromAPI("branches", req.query);
    res.json(data);
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

// Basic Route
app.get("/", (req, res) => res.send("Hello World!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
