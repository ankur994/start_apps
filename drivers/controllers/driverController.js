var Promise = require('bluebird');
var _ = require('underscore');
var Driver = require('./../../models/driver');
var common = require('./../../commonFunctions');
var url = require ('./../../config');
const secretKey = process.env.JWT_KEY = 'secret';
var jwt = require('jsonwebtoken');
var otp = require ('../../commonFunctions');


//-----------------Register driver-------------------------
function register_driver(req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield Driver.find ({$or:[
            {email: req.body.email}, 
            {phone_number: req.body.phone_number}
        ]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Driver already exists',
                status: 400,
                data: {}
            })
        }
        let registerToken = jwt.sign({email: req.body.email, _id: req.body._id}, secretKey, {expiresIn: '50d'})

        let registerDriver = yield Driver.create ({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: yield common.bcryptHash(req.body.password),
            phone_number: req.body.phone_number,
            otp: otp.generateOTP(),
            access_token: registerToken,
            location: {
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude]
            }
        })
        if (_.isEmpty (registerDriver)){
            return res.send ({
                message: 'Error in Registration',
                status: 400,
                data: {}
            })
        }
        return res.send({
            message: 'Registration successfull',
            status: 200,
            data: { registerDriver }
        })
    })
    ().catch((error) => {
        console.log('Register driver: Something went wrong', error)
        return res.send({
            "message": "Register error: Something went wrong",
            "status": 401,
            "data": {}
        })
    });
}

//------------------------Verify OTP---------------------------
function verify_otp_driver (req, res){
    Promise.coroutine (function *(){
        let checkPhone = yield Driver.find ({
            phone_number: req.body.phone_number
        })
        if (_.isEmpty (checkPhone)){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        if (checkPhone[0].is_deleted == true){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        let otp = req.body.otp;
        if (otp != checkPhone[0].otp){
            return res.send ({
                message: 'Invalid or expired otp',
                status: 400,
                data: {}
            })
        }
        if (checkPhone[0].is_verify == true){
            return res.send ({
                message: 'OTP already verified',
                status: 400,
                data: {}
            })
        }
        yield Driver.update ({phone_number: checkPhone[0].phone_number},{is_verify: true})
        return res.send ({
            message: 'OTP verified successfully',
            status: 200,
            data:{}
        })
    })
    ().catch((error) => {
        console.log('Verify OTP: Something went wrong', error)
        return res.send({
            "message": 'Verify OTP: Something went wrong',
            "status": 401,
            "data": {}
        })
    });
}

//------------------------Login------------------------------
function login_driver(req, res) {
    Promise.coroutine(function* () {
        let checkEmail = yield Driver.find({
            email: req.body.email
        })

        if (_.isEmpty(checkEmail)) {
            return res.send({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_deleted == true){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_verify == false){
            return res.send ({
                message: "Email is not verified",
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_blocked == true) {
            return res.send ({
                message: "Your account has been blocked.",
                status: 400,
                data: {}
            })
        }
        let password = yield common.bcryptHashCompare(req.body.password, checkEmail[0].password);
        if (!password){
            return res.send ({
                message: "Email and password doesn't match",
                status: 400,
                data: {}
            })
        }

        let access_token = jwt.sign({email: checkEmail[0].email, _id: checkEmail[0]._id }, secretKey, { expiresIn: '50d' });
        yield Driver.update ({email: checkEmail[0].email}, {access_token: access_token});
     
        return res.send ({
            message: 'Login successfully',
            status: 200,
            data: {access_token}
        })
        
    })
    ().catch((error) => {
        console.log('Login driver: Something went wrong', error)
        return res.send({
            message: "Login error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}

//-------------------Forgot Password---------------------------
function forgot_password_driver (req, res){
    Promise.coroutine (function *(){
        let checkEmail = yield Driver.find({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send({
                message: "Driver not found",
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_deleted == true){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        let reset_password = yield Driver.update ({email: req.body.email}, {password: yield common.bcryptHash (req.body.password)});
        if(!_.isEmpty (reset_password)){
            return res.send ({
                message: 'Password updated successfully',
                status: 200,
                data: {}
            })
        }
        return res.send ({
            message: 'Not updated',
            status: 400,
            data: {}
        })
    })
    ().catch((error) => {
        console.log('Forgot Password: Something went wrong', error)
        return res.send({
            message: 'Forgot Password error: Something went wrong',
            status: 401,
            data: {}
        })
    });
}

//-------------------Change Password-----------------------------
function change_password_driver(req, res) {
    Promise.coroutine (function *() {
        let checkEmail = yield Driver.find ({ 
            email: req.body.userData.email
        })
        if (_.isEmpty (checkEmail)){ 
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data:{}
            })
        }
        let oldPassword = yield common.bcryptHashCompare (req.body.oldPassword, checkEmail[0].password);
        if(!oldPassword){
            return res.send ({
                message: 'Old password is incorrect',
                status: 400,
                data: {}
            })
        }
        let newPassword = yield Driver.update ({email: req.body.userData.email},{password: yield common.bcryptHash (req.body.newPassword)});
        if(req.body.oldPassword == req.body.newPassword){
            return res.send({
                message: "Old and new password can't be same",
                status: 400,
                data: {}
            })
        }
        if (!_.isEmpty(newPassword)){
            return res.send ({
                message: 'Password changed successfully',
                status: 200,
                data: {}
            })
        }
        return res.send ({
            message: 'Error in change password',
            status: 400,
            data: {}
        })
    })
    ().catch((error) => {
        console.log('Change Password: Something went wrong', error)
        return res.send({
            message: "Change Password error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}

//-------------------------Update driver----------------------------
function update_driver(req, res) {
    Promise.coroutine (function *(){
        let checkId = yield Driver.find ({ _id: req.body.userData._id });
        if (_.isEmpty (checkId)){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        let checkEmail = yield Driver.find ({$or: [{email: req.body.email}, {phone_number: req.body.phone_number}]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Driver already exists',
                status: 400,
                data: {}
            })
        }
        let opts = {}
        if (req.body.first_name){
            opts.first_name = req.body.first_name
        }
        if (req.body.last_name){
            opts.last_name = req.body.last_name
        }
        if (req.body.email){
            opts.email = req.body.email;
        }
        if (req.body.phone_number){
            opts.phone_number = req.body.phone_number
        }
        let update_detail = yield Driver.update ({_id: req.body.userData._id}, opts);
        if (_.isEmpty (update_detail)){
            return res.send ({
                message: 'Error in updating driver details',
                status: 400,
                data: {}
            })
        }
        return res.send ({
            message: 'Profile Updated successfully',
            status: 200,
            data: {opts}
        })
    })
    ().catch((error) => {
        console.log('Update driver: Something went wrong', error)
        return res.send({
            message: 'Update driver error: Something went wrong',
            status: 401,
            data: {}
        })
    });
}

//------------------------Block/Unblock driver-----------------------------
function block_unblock_driver (req, res) {
    Promise.coroutine (function *() {
        let checkEmail = yield Driver.find ({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }
        let is_blocked = req.body.is_blocked;

        if (is_blocked == '1'){
        yield Driver.update ({email: checkEmail[0].email},{is_blocked: true})
            return res.send ({
                message: 'Driver blocked successfully',
                status: 200,
                data: {}
            })
        }
        if (is_blocked == '0'){
        yield Driver.update ({email: checkEmail[0].email},{is_blocked: false})
            return res.send ({
                message: 'Driver unblocked successfully',
                status: 200,
                data: {}
            })
        }
        return res.send ({
            message: 'Please enter 0 or 1',
            status: 400,
            data: {}
        })
    })
    ().catch((error) => {
        console.log('Blocked/Unblocked: Something went wrong', error)
        return res.send({
            message: 'Blocked/Unblocked: Something went wrong',
            status: 400,
            data: {}
        })
    })
}

//------------------------Delete driver------------------------------
function delete_driver (req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield Driver.find ({ email: req.body.email});
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Driver not found',
                status: 400,
                data: {}
            })
        }

        let deleteDriver = yield Driver.update({ email: checkEmail[0].email }, { is_deleted: true });
        if (!_.isEmpty (deleteDriver)){
            return res.send ({
                message: 'Deleted succesfully',
                status: 200,
                data: {}
            })
        }
    })
    ().catch((error) => {
        console.log('Delete customer: Something went wrong', error)
        return res.send({
            message: "Delete customer error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}


module.exports = { register_driver, login_driver,verify_otp_driver, forgot_password_driver, change_password_driver, update_driver,
    block_unblock_driver, delete_driver }