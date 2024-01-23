const mongoose = require("mongoose");

const atmSchema = new mongoose.Schema({
  Identification: String,
  SupportedLanguages: [String],
  ATMServices: [String],
  Accessibility: [String],
  Access24HoursIndicator: Boolean,
  SupportedCurrencies: [String],
  MinimumPossibleAmount: String,
  Note: [String],
  OtherAccessibility: [
    {
      Code: String,
      Name: String,
      Description: String,
    },
  ],
  Branch: {
    Identification: String,
  },
  Location: {
    LocationCategory: [String],
    OtherLocationCategory: [
      {
        Code: String,
        Name: String,
        Description: String,
      },
    ],
    Site: {
      Identification: String,
      Name: String,
    },
    PostalAddress: {
      StreetName: String,
      TownName: String,
      CountrySubDivision: [String],
      Country: String,
      PostCode: String,
      GeoLocation: {
        GeographicCoordinates: {
          Latitude: String,
          Longitude: String,
        },
      },
    },
  },
});

const ATM = mongoose.model("ATM", atmSchema);
module.exports = { ATM };

const branchSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  Identification: String,
  SequenceNumber: String,
  Name: String,
  Type: String,
  CustomerSegment: [String],
  ServiceAndFacility: [String],
  Accessibility: [String],
  Availability: {
    StandardAvailability: {
      Day: [
        {
          Name: String,
          OpeningHours: [
            {
              OpeningTime: String,
              ClosingTime: String,
            },
          ],
        },
      ],
    },
  },
  ContactInfo: [
    {
      ContactType: String,
      ContactContent: String,
    },
  ],
  PostalAddress: {
    BuildingNumber: String,
    StreetName: String,
    TownName: String,
    CountrySubDivision: [String],
    Country: String,
    PostCode: String,
    GeoLocation: {
      GeographicCoordinates: {
        Latitude: String,
        Longitude: String,
      },
    },
  },
});

const Branch = mongoose.model("Branch", branchSchema);
module.exports = { Branch };
