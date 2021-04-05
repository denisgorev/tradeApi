const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const shareSchema = new Schema({
    name: String,
    isin: String,
    type: String,
    quantity: Number,
    currency: String
});


module.exports = mongoose.model('Share', shareSchema);


