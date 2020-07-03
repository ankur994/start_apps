var mongoose = require ('mongoose');
var schema = mongoose.Schema;
// user schema
var userSchema = new schema ({
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
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now(),
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
    }
});
mongoose.model ('vendors', userSchema);

module.exports = mongoose.model ('vendors');