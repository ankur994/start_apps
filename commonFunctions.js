const bcrypt = require('bcryptjs');
const saltRounds = 10;
var Promise = require ('bluebird');
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

function bcryptHash (options) {
       let hashPassword =  bcrypt.hash (options, saltRounds);
       return hashPassword;
}
//------------------------------------------------------------------------
function bcryptHashCompare (options, hash) {
        let bcryptHashCompare = bcrypt.compare(options, hash);
            return bcryptHashCompare;
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
function generateJWTtoken (options) {
    let access_token = jwt.sign (options, process.env.SECRET_KEY, {expiresIn: '50d'});
    return access_token;
}

module.exports = { bcryptHash, bcryptHashCompare, generateOTP, generateJWTtoken };