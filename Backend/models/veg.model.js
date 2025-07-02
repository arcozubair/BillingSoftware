const mongoose = require('mongoose');

const vegSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const Veg = mongoose.model('Veg', vegSchema);

module.exports = Veg;
