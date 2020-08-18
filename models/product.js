var mongoose = require ('mongoose');
var schema = mongoose.Schema;

var productSchema = new schema ({
    // _id: 
    //     mongoose.Schema.Types.ObjectId
    // ,
    product_name: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true,
    },
    is_available:{
        type: Boolean,
        default: true,
        required: true
    },
    is_blocked:{
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
    // created_at: {
    //     type: Date,
    //     default: Date.now()
    // }
},{timestamps: true});

var productModel = mongoose.model ('products', productSchema);
module.exports = productModel;