const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to the database");
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
