var mongoose = require ('mongoose');
var schema = mongoose.Schema;

var orderSchema = new schema ({
    //  _id: 
    //     mongoose.Schema.Types.ObjectId
    // ,
    latitude: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    customer_address: {
        type: String,
        required: true
    },
    product_id: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    }
},{timestamps: true});

var orderModel = mongoose.model ('orders', orderSchema);
module.exports = orderModel;