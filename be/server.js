const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
let branchesData = [];
let atmsData = [];

// connect to MongoDB - if you decide this isn't needed, you can remove this section
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

// function to process and extract coordinates for map visualization
function processLocationsForMap() {
  // combine and extract coordinates from stored branch and ATM data
  const locations = [...branchesData, ...atmsData].map((item) => {
    // check if the item is an ATM or a branch
    const isATM = item.hasOwnProperty("Access24HoursIndicator"); // or any other distinguishing property

    // get the correct coordinates based on whether it's an ATM or branch
    const coords = isATM
      ? item.Location.PostalAddress.GeoLocation.GeographicCoordinates
      : item.PostalAddress.GeoLocation.GeographicCoordinates;

    // return a formatted object with necessary data for each location
    return {
      latitude: parseFloat(coords.Latitude),
      longitude: parseFloat(coords.Longitude),
      id: item._id,
    };
  });

  return locations;
}

// function to fetch and store data
async function fetchDataAndStore() {
  try {
    branchesData = await fetchFromAPI("branches", {});
    atmsData = await fetchFromAPI("atms", {});
  } catch (error) {
    console.error("Error fetching and storing data:", error.message);
  }
}

fetchDataAndStore();

// root route to fetch and display branches and ATMs data
app.get("/", async (req, res) => {
  try {
    // sending formatted branch and ATM data as JSON
    const formattedBranches = formatDataForDisplay(branchesData);
    const formattedATMs = formatDataForDisplay(atmsData, true);
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
    // fetching branch data from the API and returning as JSON
    const data = await fetchFromAPI("branches", req.query);
    res.json(data);
  } catch (error) {
    // error handling for fetch operations
    res.status(500).send("Error processing request");
  }
});

// backend endpoint for getting ATMs from API
app.get("/atms", async (req, res) => {
  try {
    // fetching ATM data from the API and returning as JSON
    const data = await fetchFromAPI("atms", req.query);
    res.json(data);
  } catch (error) {
    // error handling for fetch operations
    res.status(500).send("Error processing request");
  }
});

app.get("/map-locations", (req, res) => {
  console.log("Received request for map locations");
  const locationData = processLocationsForMap();
  console.log("Location data:", locationData);
  res.json(locationData);
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
