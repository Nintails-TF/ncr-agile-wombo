const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Basic Route
app.get('/', (req, res) => res.send('Hello World!'));

if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB without deprecated options
  mongoose.connect(
    "mongodb+srv://2455344:hello12345@unicluster.0xfojui.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
