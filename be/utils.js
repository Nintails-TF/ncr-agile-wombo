const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://wombo-412213.nw.r.appspot.com/api/';

// Modified function to handle both GET and POST requests
async function fetchFromAPI(endpoint, data, method = 'GET') {
    try {
        let response;
        if (method === 'GET') {
            response = await axios.get(`${API_BASE_URL}${endpoint}`, {
                params: data,
                timeout: 5000
            });
        } else if (method === 'POST') {
            response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
                timeout: 5000
            });
        }

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error(`API request error for ${endpoint}:`, error.message);
        throw error;
    }
}



// Formats the address of either an ATM or a Branch
function formatAddress(item, isATM) {
    if (isATM && item.Location?.PostalAddress) {
        // Format address for ATM
        return `${item.Location.PostalAddress.StreetName}, ${item.Location.PostalAddress.CountrySubDivision}, ${item.Location.PostalAddress.PostCode}`;
    } else if (!isATM && item.PostalAddress) {
        // Format address for Branch
        return `${item.PostalAddress.StreetName}, ${item.PostalAddress.CountrySubDivision}, ${item.PostalAddress.PostCode}`;
    }
    // Default return when address is not available
    return "No address available";
}

// Formats the accessibility features for ATMs and Branches
function formatAccessibilityFeatures(item, isATM) {
    if (isATM) {
        // Combine general and other accessibility features for ATM
        return [
            ...(item.Accessibility || []),
            ...(item.OtherAccessibility ? item.OtherAccessibility.map(access => access.Name) : []),
        ].join(", ");
    }
    // For Branches, use only the Accessibility field
    return item.Accessibility?.join(", ") || "Not Available";
}

// Formats data for displaying in a list view, catering to both ATMs and Branches
function formatDataForDisplay(data, isATM = false) {
    return data.map(item => {
        // Determine name based on whether item is an ATM or Branch
        const name = item.Name || (isATM && item.Location?.Site?.Name);
        // Format address
        const address = formatAddress(item, isATM);
        // Format accessibility features
        const accessibilityFeatures = formatAccessibilityFeatures(item, isATM);

        // Process and include additional details for ATMs and Branches
        let additionalDetails = {
            openingHours: !isATM ? groupAndFormatOpeningHours(item.Availability?.StandardAvailability?.Day) || "Not Available" : undefined,
            phoneNumber: !isATM ? item.ContactInfo?.find(contact => contact.ContactType === "Phone")?.ContactContent || "Not Available" : undefined,
            wifi: !isATM ? (item.ServiceAndFacility?.includes("WiFi") ? "Available" : "Not Available") : undefined,
            minimumAmount: isATM ? item.MinimumPossibleAmount || "Not Available" : undefined,
            customerSegment: !isATM ? item.CustomerSegment?.join(", ") || "Not Available" : undefined,
            coordinates: item.Location?.PostalAddress?.GeoLocation?.GeographicCoordinates || item.PostalAddress?.GeoLocation?.GeographicCoordinates || "Not Available",
            id: item._id,
            type: isATM ? "ATM" : "Branch",
        };

        // Return a structured object with all formatted data
        return {
            name,
            address,
            accessibilityFeatures,
            ...additionalDetails,
        };
    });
}


// Helper function to group and format opening hours.
function groupAndFormatOpeningHours(days) {
    // Check if the days data is available, return "Not Available" if not
    if (!days) return "Not Available";

    // Reduce the days array to group days with the same opening hours
    const groupedHours = days.reduce((acc, day) => {
        // Format the opening hours for the current day into a string
        const hours = day.OpeningHours.map(
            oh => `${oh.OpeningTime} - ${oh.ClosingTime}`
        ).join(", ");

        // Group days with identical opening hours
        acc[hours] = acc[hours] || [];
        acc[hours].push(day.Name);
        return acc;
    }, {});

    // Convert the grouped hours object into a formatted string
    return Object.entries(groupedHours)
        .map(([hours, groupedDays]) => {
            // Format differently based on whether multiple days share the same hours
            return groupedDays.length > 1
                ? `${groupedDays[0].slice(0, 3)} - ${groupedDays[groupedDays.length - 1].slice(0, 3)} ${hours}`
                : `${groupedDays[0]} ${hours}`;
        })
        .join("; "); // Join all formatted strings with a semicolon and space
}



module.exports = { fetchFromAPI, formatDataForDisplay, groupAndFormatOpeningHours };
