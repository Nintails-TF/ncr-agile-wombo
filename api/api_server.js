require('dotenv').config();
const express = require('express');
const connectDB = require('./database'); // Import the database connection function
const atmRoutes = require('./atmRoutes');
const branchRoutes = require('./branchRoutes');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

connectDB(); // Connect to the database

app.use(atmRoutes);
app.use(branchRoutes);

// Root Endpoint
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// 404 Error Handler (for any unhandled routes)
app.use((req, res, next) => {
    res.status(404).send("Resource not found");
});

// Generic Error Handler
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));

