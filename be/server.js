const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
let branchesData = [];
let atmsData = [];

app.use(cors());

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

// function to format the data for displaying in list view
function formatDataForDisplay(data, isATM = false) {
  return data.map((item, index) => {
    // for ATMs, name is extracted from the Location property, otherwise use item.Name
    const name = item.Name || (isATM && item.Location?.Site?.Name);

    // building the address string
    let address = "";
    if (isATM) {
      // for ATMs, extract address from the Location property
      address = item.Location?.PostalAddress
        ? `${item.Location.PostalAddress.StreetName}, ${item.Location.PostalAddress.CountrySubDivision}, ${item.Location.PostalAddress.PostCode}`
        : "No address available";
    } else {
      // for branches, use the PostalAddress directly
      address = item.PostalAddress
        ? `${item.PostalAddress.StreetName}, ${item.PostalAddress.CountrySubDivision}, ${item.PostalAddress.PostCode}`
        : "No address available";
    }

    // process accessibility features differently for branches and ATMs
    let accessibilityFeatures = "";
    if (isATM) {
      // combining Accessibility and OtherAccessibility for ATMs
      accessibilityFeatures = [
        ...(item.Accessibility || []),
        ...(item.OtherAccessibility
          ? item.OtherAccessibility.map((oa) => oa.Name)
          : []),
      ].join(", ");
    } else {
      // only Accessibility for branches
      accessibilityFeatures = item.Accessibility?.join(", ");
    }

    // additional details for branches and ATMs
    let openingHours,
      phoneNumber,
      wifi,
      minimumAmount,
      id,
      customerSegment,
      coordinates;
    if (isATM) {
      // additional details specific to ATMs
      minimumAmount = item.MinimumPossibleAmount || "Not Available";
      id = item._id;
      coordinates = item.Location?.PostalAddress?.GeoLocation?.GeographicCoordinates;
    } else {
      // additional details specific to branches
      openingHours = groupAndFormatOpeningHours(
        item.Availability?.StandardAvailability?.Day
      );
      phoneNumber = item.ContactInfo?.find(
        (ci) => ci.ContactType === "Phone"
      )?.ContactContent;
      wifi = item.ServiceAndFacility?.includes("WiFi")
        ? "Available"
        : "Not Available";
      id = item._id;
      customerSegment = item.CustomerSegment?.join(", ") || "Not Available";
      coordinates = item.PostalAddress?.GeoLocation?.GeographicCoordinates;
    }

    // return a structured object for each item
    return {
      name,
      address,
      openingHours: !isATM ? openingHours || "Not Available" : undefined,
      accessibilityFeatures: accessibilityFeatures || "Not Available",
      phoneNumber: !isATM ? phoneNumber || "Not Available" : undefined,
      wifi: !isATM ? wifi || "Not Available" : undefined,
      minimumAmount: isATM ? minimumAmount : undefined,
      id: id,
      customerSegment: !isATM ? customerSegment : undefined,
      coordinates: coordinates || "Not Available",
      type: isATM ? "ATM" : "Branch",
    };
  });
}

// helper function to group and format opening hours
function groupAndFormatOpeningHours(days) {
  if (!days) return "Not Available"; // return "Not Available" if there are no days data

  // reduce function to group days with the same opening hours
  const groupedHours = days.reduce((acc, day) => {
    // create a string representation of the opening hours for the current day
    const hours = day.OpeningHours.map(
      (oh) => `${oh.OpeningTime} - ${oh.ClosingTime}`
    ).join(", ");

    // group days with the same opening hours together
    if (acc[hours]) {
      acc[hours].push(day.Name);
    } else {
      acc[hours] = [day.Name];
    }
    return acc;
  }, {});

  // map over the grouped hours to create formatted strings
  return Object.entries(groupedHours)
    .map(([hours, days]) => {
      // if multiple days have the same hours, concatenate their names
      if (days.length > 1) {
        return `${days[0].slice(0, 3)} - ${days[days.length - 1].slice(
          0,
          3
        )} ${hours}`;
      }
      // if only one day has these hours, list it individually
      return `${days[0]} ${hours}`;
    })
    .join("; "); // join the strings with semicolon and space
}

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
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

// endpoint to get formatted data for list view
app.get("/list-view-data", (req, res) => {
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
