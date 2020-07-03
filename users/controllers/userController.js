var Promise = require('bluebird');
var _ = require('underscore');
var User = require('./../../models/user');
var common = require('./../../commonFunctions');
var url = require ('./../../config');
const secretKey = process.env.JWT_KEY = 'secret';
var jwt = require('jsonwebtoken');


//-----------------Register user-------------------------
function register_user(req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield User.find ({$or:[
            {email: req.body.email}, 
            {phone_number: req.body.phone_number}
        ]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'User already exists',
                status: 400,
                data: {}
            })
        }
        let registerToken = jwt.sign({email: req.body.email}, secretKey, {expiresIn: '50d'})

        let registerUser = yield User.create ({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: yield common.bcryptHash(req.body.password),
            phone_number: req.body.phone_number,
            otp: '1111',
            access_token: registerToken
        })
        if (_.isEmpty (registerUser)){
            return res.send ({
                message: 'Error in Registration',
                status: 400,
                data: {}
            })
        }
        return res.send({
            message: 'Registration successfull',
            status: 200,
            data: { registerUser }
        })
    })
    ().catch((error) => {
        console.log('Register user: Something went wrong', error)
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
        let checkPhone = yield User.find ({
            phone_number: req.body.phone_number
        })
        if (_.isEmpty (checkPhone)){
            return res.send ({
                message: 'User not found',
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
        yield User.update ({phone_number: req.body.phone_number},{is_verify: true})
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
function login_user(req, res) {
    Promise.coroutine(function* () {
        let checkEmail = yield User.find({
            email: req.body.email
        })
        if (_.isEmpty(checkEmail)) {
            return res.send({
                message: 'User not found',
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
        let password = yield common.bcryptHashCompare(req.body.password, checkEmail[0].password);
        if (!password){
            return res.send ({
                message: "Email and password doesn't match",
                status: 400,
                data: {}
            })
        }

        let access_token = jwt.sign({email: checkEmail[0].email, _id: checkEmail[0]._id }, secretKey, { expiresIn: '50d' },'loginToken');
        yield User.update ({email: checkEmail[0].email}, {access_token: access_token});
     
        return res.send ({
            message: 'Login successfully',
            status: 200,
            data: {access_token}
        })
        
    })
    ().catch((error) => {
        console.log('Login user: Something went wrong', error)
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
        let checkEmail = yield User.find({
            email: req.body.email
        })
        if (_.isEmpty (checkEmail)){
            return res.send({
                message: "User not found",
                status: 400,
                data: {}
            })
        }
        let reset_password = yield User.update ({email: req.body.email}, {password: yield common.bcryptHash (req.body.password)});
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
function change_password (req, res) {
    Promise.coroutine (function *() {
        // if (req.body.email != req.body.userData.email){
        //     return res.send ({
        //         message: 'not match'
        //     })
        // }
        let checkEmail = yield User.find ({ 
            email: req.body.userData.email
        })
        if (_.isEmpty (checkEmail)){ 
            return res.send ({
                message: 'User not found',
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
        let newPassword = yield User.update ({email: req.body.userData.email},{password: yield common.bcryptHash (req.body.newPassword)});
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

//------------------------Delete user------------------------------
function delete_user (req, res) {
    Promise.coroutine (function *(){
        let checkEmail = yield User.find ({ email: req.body.email});
        if (_.isEmpty (checkEmail)){
            return res.send ({
                message: 'User not found',
                status: 400,
                data: {}
            })
        }
        let deleteUser = yield User.deleteOne ({email: req.body.email});
        if (!_.isEmpty (deleteUser)){
            return res.send ({
                message: 'Deleted succesfully',
                status: 200,
                data: {}
            })
        }
    })
    ().catch((error) => {
        console.log('Delete user: Something went wrong', error)
        return res.send({
            message: "Delete user error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}

//-------------------------Update user----------------------------
function update_user(req, res) {
    Promise.coroutine (function *(){
        let checkId = yield User.find ({ _id: req.body.userData._id });
        if (_.isEmpty (checkId)){
            return res.send ({
                message: 'User not found',
                status: 400,
                data: {}
            })
        }
        let checkEmail = yield User.find ({$or: [{email: req.body.email}, {phone_number: req.body.phone_number}]})
        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: 'User already exists',
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

        let update_detail = yield User.update ({_id: req.body.userData._id}, opts);
        if (_.isEmpty (update_detail)){
            return res.send ({
                message: 'Error in updating user details',
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
        console.log('Update user: Something went wrong', error)
        return res.send({
            message: 'Update user error: Something went wrong',
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
     
        yield User.update({ access_token: req.token }, { is_verify: true });
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
module.exports = { register_user, verify_otp, login_user, forgot_password, change_password, delete_user, update_user, verify_token}