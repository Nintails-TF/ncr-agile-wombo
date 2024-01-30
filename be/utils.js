const axios = require('axios');

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

module.exports = { fetchFromAPI, formatDataForDisplay, groupAndFormatOpeningHours };
