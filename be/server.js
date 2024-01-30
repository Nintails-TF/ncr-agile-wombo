require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./database'); // Assuming you have this module for DB connection
const routes = require('./routes');

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

// Use the routes defined in routes.js
app.use('/', routes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
