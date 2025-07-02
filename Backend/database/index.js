const mongoose = require("mongoose");

async function ConnectDB() {
    try {
         await mongoose.connect("mongodb+srv://zubair:zubair2024@inventory.zheqesn.mongodb.net/inventorysystem?retryWrites=true&w=majority&appName=inventory");
        console.log("MONGODB connection Successful !! ");
    } catch (error) {
        console.log("MONGO DB ERROR", error);
    }
}

module.exports = ConnectDB;
