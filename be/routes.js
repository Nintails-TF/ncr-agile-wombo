const express = require("express");
const router = express.Router();
const { fetchFromAPI, formatDataForDisplay } = require("./utils");
const { getCachedData, setCachedData, withCache } = require('./cacheUtil');



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

router.get("/branches", async (req, res) => {
    try {
        const requestData = { params: req.query };
        const data = await withCache(fetchFromAPI, "branches", requestData, 'GET');
        res.json(data);
    } catch (error) {
        res.status(500).send("Error processing request");
    }
});


// backend endpoint for getting ATMs from API
router.get("/atms", async (req, res) => {
    try {
        const requestData = { params: req.query };
        const data = await withCache(fetchFromAPI, "atms", requestData, 'GET');
        res.json(data);
    } catch (error) {
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

router.post("/atms/filter", async (req, res) => {
    try {
        const atmFilterCriteria = {
            Accessibility: req.body.Accessibility,
            ATMServices: req.body.ATMServices,
            Access24HoursIndicator: req.body.Access24HoursIndicator,
            Latitude: req.body.Latitude,
            Longitude: req.body.Longitude,
            Radius: req.body.Radius,
        };

        const requestData = {
            body: atmFilterCriteria,
            headers: { "Content-Type": "application/json" }
        };

        const data = await withCache(fetchFromAPI, "atms/filter", requestData, 'POST');
        res.json(data);
    } catch (error) {
        console.error("Error in /atms/filter route:", error.message);
        res.status(500).send("Error processing request");
    }
});

// Route for getting filtered branches
router.post("/branches/filter", async (req, res) => {
    try {
        const branchFilterCriteria = {
            Accessibility: req.body.Accessibility,
            ServiceAndFacility: req.body.ServiceAndFacility,
            Latitude: req.body.Latitude,
            Longitude: req.body.Longitude,
            Radius: req.body.Radius,
        };

        // Using withCache but wrapping axios call in a function
        const data = await withCache(async () => {
            const response = await axios(createFilterConfig("branches/filter", branchFilterCriteria));
            return response.data;
        }, "branches/filter", branchFilterCriteria, 'POST');

        res.json(data);
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
