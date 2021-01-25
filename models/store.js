const { number } = require('@hapi/joi');
var mongoose = require ('mongoose');
var schema = mongoose.Schema;

var storeSchema = new schema ({
    merchant_name: {
        type: String, 
        required: true
    },
    store_name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
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
    location: {
        type: { type: String },
        coordinates: [Number]
     }
  
},{timestamps: true})
storeSchema.index({ location: "2dsphere" });

var storeModel = mongoose.model ('stores', storeSchema);
module.exports = storeModel;