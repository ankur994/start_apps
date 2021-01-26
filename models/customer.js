var mongoose = require ('mongoose');
var schema = mongoose.Schema;

var customerSchema = new schema ({
    first_name: {
        type: String, 
        required: true
    },
    last_name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    is_verify: {
        type: Boolean,
        default: false
    },
    access_token: {
        type: String,
        required: true
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    // created_at: {
    //     type: Date,
    //     default: Date.now(),
    // },
},{timestamps: true})

var customerModel = mongoose.model ('customers', customerSchema);
module.exports = customerModel;