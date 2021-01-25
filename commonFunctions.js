const bcrypt = require('bcryptjs');
const saltRounds = 10;
var Promise = require ('bluebird');
var constants = require ('./constants');
var _ = require ('underscore');
const jwt = require('jsonwebtoken');
const { func } = require('@hapi/joi');


// function bcryptHash (options) {
//     return new Promise ((resolve, reject) => {
//         bcrypt.hash (options, saltRounds, (error, hash) => {
//             if (error){
//                 reject (error)
//             }
//             resolve (hash)
//         })
//     })
// }

async function bcryptHash (options) {
    try {
       let hashPassword = await bcrypt.hash (options, saltRounds);
       return hashPassword;

    } catch (error) {
        console.log ('Error in bcrypt hash', error)
        return res.send ({
            "message": constants.responseMessages.SOMETHING_WENT_WRONG,
            "status": constants.responseFlags.SOMETHING_WENT_WRONG,
            "data": {}
        })
    }
}
//------------------------------------------------------------------------
function bcryptHashCompare (options, hash) {
    return new Promise ((resolve, reject) => {
        bcrypt.compare(options, hash, (error, hash) => {
            if (error){
                reject (error)
            }
            resolve (hash)
        });
    })
}

//-------------------------------------------------------------------------
function generateOTP() {
    try {
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        }
        return OTP; 

    } catch (error) {
        return res.send({
            message: 'Invalid otp',
            status: 400,
            data: {}
        });
    }
}

//---------------------- JWT signin-------------------------
async function generateJWTtoken (options) {
    try{
        let access_token = await jwt.sign (options, process.env.SECRET_KEY, {expiresIn: '50d'});
        return access_token;
    }
    catch (error) {
        console.log ('Error in generating token', error)
        return res.send ({
            "message": constants.responseMessages.SOMETHING_WENT_WRONG,
            "status": constants.responseFlags.SOMETHING_WENT_WRONG,
            "data": {}
        })
    }
}

module.exports = { bcryptHash, bcryptHashCompare, generateOTP, generateJWTtoken };