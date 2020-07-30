var mongoose = require ('mongoose');
var schema = mongoose.Schema;
// job schema
var jobSchema = new schema ({
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
    _id: {
        type: String,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now(),
    }
});
mongoose.model ('jobs', jobSchema);

module.exports = mongoose.model ('jobs');