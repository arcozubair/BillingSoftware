const mongoose = require("mongoose");

async function ConnectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/BillingSystem");
        console.log("MONGODB connection Successful !! ");
    } catch (error) {
        console.log("MONGO DB ERROR", error);
    }
}

module.exports = ConnectDB;
