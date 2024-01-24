const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();

// connect to MongoDB            PRETTY SURE THIS ISNT NEEDED
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(
      "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}

// function to retrieve data from an endpoint
async function fetchFromAPI(endpoint, params) {
  try {
    // making a GET request to the API using axios
    const response = await axios.get(
      `https://wombo-412213.nw.r.appspot.com/api/${endpoint}`,
      { params }
    );
    // returning the data from the API response
    return response.data;
  } catch (error) {
    // logging the error and rethrowing it for caller handling
    console.error("API request error:", error.message);
    throw error;
  }
}

// function to format the data for displaying
function formatDataForDisplay(data, isATM = false) {
  // creating a new array with objects containing formatted data and a name for sorting
  const mappedData = data.map((item, index) => {
    const name = item.Name || (isATM && item.Location?.Site?.Name);
    let address = "No address available";

    // determine the address format based on whether it's an ATM or Branch
    if (isATM) {
      address = item.Location.PostalAddress.StreetName;
    } else {
      address =
        `${item.PostalAddress.BuildingNumber} ${item.PostalAddress.StreetName}`.trim();
    }

    // return the formatted string and the name for sorting
    return {
      formattedString: isATM
        ? `ATM ${index + 1}: ${name} - ${address}`
        : `Branch ${item.Identification}: ${name} - ${address}`,
      sortableName: name,
    };
  });

  // sorting the array by name
  mappedData.sort((a, b) => a.sortableName.localeCompare(b.sortableName));

  // extracting just the formatted strings from the sorted array
  return mappedData.map((item) => item.formattedString);
}

// root route to fetch and display branches and ATMs data
app.get("/", async (req, res) => {
  try {
    // fetching and formatting branch data
    const branchesData = await fetchFromAPI("branches", {});
    const formattedBranches = formatDataForDisplay(branchesData);

    // fetching and formatting ATM data, 'true' indicates ATM data
    const atmsData = await fetchFromAPI("atms", {});
    const formattedATMs = formatDataForDisplay(atmsData, true);

    // sending formatted data as JSON
    res.json({
      branches: formattedBranches,
      atms: formattedATMs,
    });
  } catch (error) {
    // error handling for fetch operations
    console.error("Error fetching data:", error.message);
    res.status(500).send("Error processing request");
  }
});

// backend endpoint for getting branches from API
app.get("/branches", async (req, res) => {
  try {
    const data = await fetchFromAPI("branches", req.query);
    res.json(data);
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

// backend endpoint for getting ATMs from API
app.get("/atms", async (req, res) => {
  try {
    const data = await fetchFromAPI("atms", req.query);
    res.json(data);
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
