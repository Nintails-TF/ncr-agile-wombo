const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

// I'm confused what this bit is for?
const { MongoClient, ServerApiVersion } = require("mongodb");

// MongoDB URI
const uri = "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority";

// Middleware
app.use(express.json());



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// ATM Schema
const atmSchema = new mongoose.Schema({
    Identification: String,
    SupportedLanguages: [String],
    ATMServices: [String],
    Accessibility: [String],
    Access24HoursIndicator: Boolean,
    SupportedCurrencies: [String],
    MinimumPossibleAmount: String,
    Note: [String],
    OtherAccessibility: [{
        Code: String,
        Name: String,
        Description: String
    }],
    Branch: {
        Identification: String
    },
    Location: {
        LocationCategory: [String],
        OtherLocationCategory: [{
            Code: String,
            Name: String,
            Description: String
        }],
        Site: {
            Identification: String,
            Name: String
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
                    Longitude: String
                }
            }
        }
    }
});

const ATM = mongoose.model('ATM', atmSchema);


// API Endpoints
app.get("/", (req, res) => res.send("Hello World!"));

// Endpoint to get ATMs
app.get('/atms', async (req, res) => {
    try {
        const atms = await ATM.find({});
        res.json(atms);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Listen on the specified port
app.listen(port, () => console.log(`API server listening on port ${port}!`));
