var Promise = require('bluebird');
var _ = require('underscore');
var Customer = require('../../models/customer');
var Driver = require ('../../models/driver');
var common = require('../../commonFunctions');
var otp = require ('../../commonFunctions');
var url = require ('../../config');
const secretKey = process.env.JWT_KEY = 'secret';
var jwt = require('jsonwebtoken');
var mail = require ('../../mail');

//-----------------Register customer-------------------------
function register_customer(req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield Customer.find ({$or:[
            {email: req.body.email}, 
            {phone_number: req.body.phone_number}
        ]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Customer already exists',
                status: 400,
                data: {}
            })
        }
        let registerToken = jwt.sign({email: req.body.email, _id: req.body._id}, secretKey, {expiresIn: '50d'})

        let registerCustomer = yield Customer.create ({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: yield common.bcryptHash(req.body.password),
            phone_number: req.body.phone_number,
            otp: otp.generateOTP(),
            access_token: registerToken
        })
        if (_.isEmpty (registerCustomer)){
            return res.send ({
                message: 'Error in Registration',
                status: 400,
                data: {}
            })
        }
        mail.sendMail({
            otp: registerCustomer.otp, email: registerCustomer.email
        });
        return res.send({
            message: 'Registration successfull',
            status: 200,
            data: { registerCustomer }
        })
    })
    ().catch((error) => {
        console.log('Register customer: Something went wrong', error)
        return res.send({
            "message": "Register error: Something went wrong",
            "status": 401,
            "data": {}
        })
    });
}

//------------------------Verify OTP---------------------------
function verify_otp (req, res){
    Promise.coroutine (function *(){
        let checkPhone = yield Customer.find ({
            phone_number: req.body.phone_number
        })
        if (_.isEmpty (checkPhone)){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        if (checkPhone[0].is_deleted == true){
            return res.send ({
                message: 'Customer not found',
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
        yield Customer.update ({phone_number: req.body.phone_number},{is_verify: true})
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
function login_customer(req, res) {
    Promise.coroutine(function* () {
        let checkEmail = yield Customer.find({
            email: req.body.email
        })
        if (_.isEmpty(checkEmail)) {
            return res.send({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_deleted == true){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_verify == false){
            return res.send ({
                message: 'Email is not verified',
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
        yield Customer.update ({email: checkEmail[0].email}, {access_token: access_token});

        return res.send ({
            message: 'Login successfully',
            status: 200,
            data: {access_token}
        })
        
    })
    ().catch((error) => {
        console.log('Login customer: Something went wrong', error)
        return res.send({
            message: "Login error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}

//-------------------Forgot Password---------------------------
function forgot_password (req, res){
    Promise.coroutine (function *(){
        let checkEmail = yield Customer.find({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send({
                message: "Customer not found",
                status: 400,
                data: {}
            })
        }
        if (checkEmail[0].is_deleted == true){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        let reset_password = yield Customer.update ({email: checkEmail[0].email}, {password: yield common.bcryptHash (req.body.password)});
        if(_.isEmpty (reset_password)){
            return res.send ({
                message: 'Error in updating password',
                status: 200,
                data: {}
            })
        }
        return res.send ({
            message: 'Password updated successfully',
            status: 200,
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
function change_password (req, res) {
    Promise.coroutine (function *() {
        // if (req.body.email != req.body.userData.email){
        //     return res.send ({
        //         message: 'not match'
        //     })
        // }
        let checkEmail = yield Customer.find ({ 
            email: req.body.userData.email
        })
        if (_.isEmpty (checkEmail)){ 
            return res.send ({
                message: 'Customer not found',
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
        let newPassword = yield Customer.update ({email: checkEmail[0].email},{password: yield common.bcryptHash (req.body.newPassword)});
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

//------------------------Delete customer------------------------------
function delete_customer (req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield Customer.find ({ email: req.body.email});
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }

        let deleteCustomer = yield Customer.update({ email: checkEmail[0].email }, { is_deleted: true });
        if (!_.isEmpty (deleteCustomer)){
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

//-------------------------Update customer----------------------------
function update_customer(req, res) {
    Promise.coroutine (function *(){
        let checkId = yield Customer.find ({ _id: req.body.userData._id });
        if (_.isEmpty (checkId)){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        let checkEmail = yield Customer.find ({$or: [{email: req.body.email}, {phone_number: req.body.phone_number}]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Customer already exists',
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

        let update_detail = yield Customer.update ({_id: req.body.userData._id}, opts);
        if (_.isEmpty (update_detail)){
            return res.send ({
                message: 'Error in updating customer details',
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
        console.log('Update customer: Something went wrong', error)
        return res.send({
            message: 'Update customer error: Something went wrong',
            status: 401,
            data: {}
        })
    });
}

//--------------------------Verify token---------------------------
function verify_token (req, res) {
    Promise.coroutine (function* () {

        jwt.verify(req.token, secretKey);
        if (!req.token) {
            return res.send({
                message: 'Invalid token or token expired',
                status: 400,
                data: {}
            })
        }
     
        yield Customer.update({ access_token: req.token }, { is_verify: true });
        return res.send({
            message: 'Token verified successfully',
            status: 400,
            data: {}
        })
    })
    ().catch((error) => {
        console.log('Verify Token: Something went wrong', error)
        return res.send({
            message: 'Verify Token: Something went wrong',
            status: 400,
            data: {}
        })
    })
}

//------------------------Block/Unblock customer-----------------------------
function block_unblock_customer (req, res) {
    Promise.coroutine (function *() {
        let checkEmail = yield Customer.find ({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        let is_blocked = req.body.is_blocked;

        if (is_blocked == '1'){
        yield Customer.update ({email: checkEmail[0].email},{is_blocked: true})
            return res.send ({
                message: 'Customer blocked successfully',
                status: 200,
                data: {}
            })
        }
        if (is_blocked == '0'){
        yield Customer.update ({email: checkEmail[0].email},{is_blocked: false})
            return res.send ({
                message: 'Customer unblocked successfully',
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

//----------------------------Get all drivers--------------------------------
function get_all_drivers (req, res){
    Promise.coroutine (function *() {
        let checkEmail = yield Customer.find ({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'Customer not found',
                status: 400,
                data: {}
            })
        }
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;

    let checkAllDrivers = yield Driver.aggregate([{
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            distanceField: "dist.calculated",
            maxDistance: 200000,        // in meters
            spherical: true,
        },
    }, {
        $match: { is_verify: true, is_blocked: false }
    }])
        let withoutPasswordDriver = [];
        checkAllDrivers.forEach((ele) => {
            delete ele.password,
            delete ele.otp,
            delete ele.access_token
            withoutPasswordDriver.push(ele);
        })
       return res.send({
           message: 'Drivers get successfully',
           status: 200,
           data: { withoutPasswordDriver }
       })
        // let checkAllDrivers = yield Driver.find ({
        //     is_verify: true, is_blocked: false
        // }, {password: 0, access_token: 0, otp: 0});
        //     return res.send ({
        //         message: 'Drivers get succcessfully',
        //         status: 200,
        //         data: {checkAllDrivers}
        //     })
    })
    ().catch((error) => {
        console.log('Get drivers : Something went wrong', error)
        return res.send({
            message: 'Get drivers : Something went wrong',
            status: 400,
            data: {}
        })
    })
}

module.exports = { register_customer, verify_otp, login_customer, forgot_password, change_password, delete_customer, update_customer, verify_token, 
    block_unblock_customer, get_all_drivers}