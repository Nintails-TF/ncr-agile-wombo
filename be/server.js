const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority", 
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Basic Route
app.get('/', (req, res) => res.send('Hello World!'));

// Server only starts if this module is run directly (e.g., not when running tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express app so it can be imported in the test file
module.exports = app;
