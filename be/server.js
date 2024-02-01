require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "fe")));

// Use the routes defined in routes.js
app.use("/", routes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
