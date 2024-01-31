const express = require("express");
const router = express.Router();
const { fetchFromAPI, formatDataForDisplay } = require("./utils");

const axios = require("axios");
const bodyParser = require("body-parser");

let branchesData = [];
let atmsData = [];

router.use(bodyParser.json());

// Function to fetch and store data
async function fetchDataAndStore() {
  try {
    branchesData = await fetchFromAPI("branches", {});
    atmsData = await fetchFromAPI("atms", {});
  } catch (error) {
    console.error("Error fetching and storing data:", error.message);
  }
}

fetchDataAndStore();

// Root endpoint
router.get("/", (req, res) => {
  res.send("Hello World!");
});

// backend endpoint for getting branches from API
router.get("/branches", async (req, res) => {
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
router.get("/atms", async (req, res) => {
  try {
    // fetching ATM data from the API and returning as JSON
    const data = await fetchFromAPI("atms", req.query);
    res.json(data);
  } catch (error) {
    // error handling for fetch operations
    res.status(500).send("Error processing request");
  }
});

// endpoint to get formatted data for list view
router.get("/list-view-data", (req, res) => {
  try {
    // combine and format data from branches and ATMs
    const formattedBranches = formatDataForDisplay(branchesData, false);
    const formattedATMs = formatDataForDisplay(atmsData, true);

    // combine formatted data from both branches and ATMs
    const combinedData = [...formattedBranches, ...formattedATMs];

    // send the combined data as a response
    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching data for list view:", error.message);
    res.status(500).send("Error processing request");
  }
});

/*router.get("/map-locations", (req, res) => {
    console.log("Received request for map locations");
    const locationData = processLocationsForMap();
    console.log("Location data:", locationData);
    res.json(locationData);
});*/

router.post("/atms/filter", async (req, res) => {
  const {
    Accessibility,
    ATMServices,
    Access24HoursIndicator,
    Latitude,
    Longitude,
    Radius,
  } = req.body;

  const filterATMsConfig = {
    method: "post",
    url: "https://wombo-412213.nw.r.appspot.com/api/atms/filter",
    data: {
      Accessibility: Accessibility,
      ATMServices: ATMServices,
      Access24HoursIndicator: Access24HoursIndicator,
      Latitude: Latitude,
      Longitude: Longitude,
      Radius: Radius,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const filteredAtms = await axios(filterATMsConfig);

  res.json(filteredAtms.data);
});

// Route for getting filtered branches
router.post("/branches/filter", async (req, res) => {
  const { Accessibility, ServiceAndFacility, Latitude, Longitude, Radius } =
    req.body;

  const filterBranchesConfig = {
    method: "post",
    url: "https://wombo-412213.nw.r.appspot.com/api/branches/filter",
    data: {
      Accessibility: Accessibility,
      ServiceAndFacility: ServiceAndFacility,
      Latitude: Latitude,
      Longitude: Longitude,
      Radius: Radius,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const filteredBranches = await axios(filterBranchesConfig);

  res.json(filteredBranches.data);
});

module.exports = router;
