const express = require("express");
const router = express.Router();
const { fetchFromAPI, formatDataForDisplay } = require("./utils");
const { getCacheKey, getCachedData, setCachedData } = require('./cacheUtil');


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
    console.log("GET /atms called with query params:", req.query);

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

// Function to create filter configuration for Axios
function createFilterConfig(apiEndpoint, filterCriteria) {
    return {
        method: "post",
        url: `${process.env.API_BASE_URL || 'https://wombo-412213.nw.r.appspot.com/api/'}${apiEndpoint}`,
        data: filterCriteria,
        headers: {
            "Content-Type": "application/json",
        },
    };
}

// Route for getting filtered ATMs
router.post("/atms/filter", async (req, res) => {
    try {
        // Specific structure for ATM request body
        const atmFilterCriteria = {
            Accessibility: req.body.Accessibility,
            ATMServices: req.body.ATMServices,
            Access24HoursIndicator: req.body.Access24HoursIndicator,
            Latitude: req.body.Latitude,
            Longitude: req.body.Longitude,
            Radius: req.body.Radius,
        };

        const cacheKey = getCacheKey("atms/filter", atmFilterCriteria, "POST");
        let cachedData = getCachedData(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for ${cacheKey} in /atms/filter`);
            return res.json(cachedData);
        }

        const filterConfig = createFilterConfig("atms/filter", atmFilterCriteria);
        const filteredAtms = await axios(filterConfig);
        setCachedData(cacheKey, filteredAtms.data);
        res.json(filteredAtms.data);

    } catch (error) {
        console.error("Error in /atms/filter route:", error.message);
        res.status(500).send("Error processing request");
    }


});

// Route for getting filtered branches
router.post("/branches/filter", async (req, res) => {
    try {
        // Specific structure for Branch request body
        const branchFilterCriteria = {
            Accessibility: req.body.Accessibility,
            ServiceAndFacility: req.body.ServiceAndFacility,
            Latitude: req.body.Latitude,
            Longitude: req.body.Longitude,
            Radius: req.body.Radius,
        };

        const cacheKey = getCacheKey("branches/filter", branchFilterCriteria, "POST");
        let cachedData = getCachedData(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for ${cacheKey} in /branches/filter`);
            return res.json(cachedData);
        }

        const filterConfig = createFilterConfig("branches/filter", branchFilterCriteria);
        const filteredBranches = await axios(filterConfig);
        setCachedData(cacheKey, filteredBranches.data);
        res.json(filteredBranches.data);


    } catch (error) {
        console.error("Error in /branches/filter route:", error.message);
        res.status(500).send("Error processing request");
    }
});

router.get("/test-cache", async (req, res) => {
    const testKey = "testKey";
    let cachedData = getCachedData(testKey);

    if (cachedData) {
        console.log(`Cache hit for ${testKey}`);
        return res.json(cachedData);
    } else {
        console.log(`Cache miss for ${testKey}`);
        const testData = { data: "This is a test" };
        setCachedData(testKey, testData);
        return res.json(testData);
    }
});


module.exports = router;
