// api_server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./database'); // Import the database connection function
const atmRoutes = require('./atmRoutes');
const branchRoutes = require('./branchRoutes');
const app = express();

app.use(express.json());

connectDB(); // Connect to the database

app.use(atmRoutes);
app.use(branchRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));

