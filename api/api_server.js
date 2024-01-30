require('dotenv').config();
const express = require('express');
const swaggerUi = require("swagger-ui-express");
const connectDB = require('./database'); // Import the database connection function
const atmRoutes = require('./atmRoutes');
const branchRoutes = require('./branchRoutes');
const app = express();
const cors = require('cors');
const swaggerDocument = require('./swagger.json');

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Validate required environment variables
if (!process.env.PORT) {
    console.error("ERROR: PORT not specified in .env");
    process.exit(1);
}

// Validate required environment variables
if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI not specified in .env");
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB().then(() => {
    // Server Start
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
}).catch(error => {
    console.error("Database connection failed", error);
    process.exit(1);
});

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