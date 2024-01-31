const mongoose = require('mongoose');

const connectDB = async () => {
    if (process.env.NODE_ENV !== "test") {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB Connected");
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
