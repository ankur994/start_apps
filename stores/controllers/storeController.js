var Promise = require('bluebird');
var _ = require('underscore');
var Store = require('../../models/store');
var common = require('../../commonFunctions');
var url = require ('../../config');
var constants = require ('../../constants');

// -----------------Register store-------------------------
async function register_store(req, res) {
    try {
        let checkEmail = await Store.find ({$or:[
            {email: req.body.email, is_deleted: false}
        ]})

        if (!_.isEmpty (checkEmail)){
            return res.send ({
                message: constants.responseMessages.STORE_ALREADY_EXISTS,
                status: constants.responseFlags.STORE_ALREADY_EXISTS,
                data: {}
            })
        }

        let registerToken = await common.generateJWTtoken({email: req.body.email, _id: req.body._id});

        let registerStore = await Store.create ({
            merchant_name: req.body.merchant_name,
            store_name: req.body.store_name,
            email: req.body.email,
            password: await common.bcryptHash(req.body.password),
            phone_number: req.body.phone_number,
            access_token: registerToken,
            location: {
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude]
             }
        })
        if (_.isEmpty (registerStore)){
            return res.send ({
                message: constants.responseMessages.ERROR_IN_REGISTRATION,
                status: constants.responseFlags.ERROR_IN_REGISTRATION,
                data: {}
            })
        }

        return res.send({
            message: constants.responseMessages.REGISTERED_SUCCESSFULLY,
            status: constants.responseFlags.REGISTERED_SUCCESSFULLY,
            data: { registerStore }
        })
    }
    catch(error) {
        console.log('Register store: Something went wrong', error)
        return res.send({
            "message": "Register error: " + constants.responseMessages.SOMETHING_WENT_WRONG,
            "status": constants.responseFlags.SOMETHING_WENT_WRONG,
            "data": {}
        })
    };
}

//------------------------Login------------------------------
async function login_store(req, res) {
    try {
        let checkEmail = await Store.find({
            email: req.body.email
        })

        if (_.isEmpty(checkEmail)) {
            return res.send({
                message: constants.responseMessages.STORE_NOT_FOUND,
                status: constants.responseFlags.STORE_NOT_FOUND,
                data: {}
            })
        }
        if (checkEmail[0].is_deleted == true){
            return res.send ({
                message: constants.responseMessages.STORE_NOT_FOUND,
                status: constants.responseFlags.STORE_NOT_FOUND,
                data: {}
            })
        }
        if (checkEmail[0].is_verify == false){
            return res.send ({
                message: constants.responseMessages.EMAIL_NOT_VERIFIED,
                status: constants.responseFlags.EMAIL_NOT_VERIFIED,
                data: {}
            })
        }
        if (checkEmail[0].is_blocked == true) {
            return res.send ({
                message: constants.responseMessages.ACCOUNT_BLOCKED,
                status: constants.responseFlags.ACCOUNT_BLOCKED,
                data: {}
            })
        }

        let password = await common.bcryptHashCompare(req.body.password, checkEmail[0].password);
        if (!password){
            return res.send ({
                message: constants.responseMessages.EMAIL_PASSWORD_NOT_MATCH,
                status: constants.responseFlags.EMAIL_PASSWORD_NOT_MATCH,
                data: {}
            })
        }

        let access_token = jwt.sign({email: checkEmail[0].email, _id: checkEmail[0]._id }, secretKey, { expiresIn: '50d' });
        await Store.updateOne ({email: checkEmail[0].email}, {access_token: access_token});

        return res.send ({
            message: constants.responseMessages.LOGIN_SUCCESS,
            status: constants.responseFlags.LOGIN_SUCCESS,
            data: {access_token}
        })
    }
    catch(error) {
        console.log('Login store: Something went wrong', error)
        return res.send({
            message: "Login error: " + constants.responseMessages.SOMETHING_WENT_WRONG,
            status: constants.responseFlags.SOMETHING_WENT_WRONG,
            data: {}
        })
    };
}

//------------------------Block/Unblock store-----------------------------
async function block_unblock_store (req, res) {
    try {
        let check_id = await Store.find ({
            _id: req.body._id
        })
        if (_.isEmpty (check_id)){
            return res.send ({
                message: constants.responseMessages.STORE_NOT_FOUND,
                status: constants.responseFlags.STORE_NOT_FOUND,
                data: {}
            })
        }
        let is_blocked = req.body.is_blocked;

        if (is_blocked == '1'){
        await Store.update ({_id: check_id[0]._id},{is_blocked: true})
            return res.send ({
                message: constants.responseMessages.STORE_BLOCKED,
                status: constants.responseFlags.STORE_BLOCKED,
                data: {}
            })
        }
        if (is_blocked == '0'){
        await Store.update ({_id: check_id[0]._id},{is_blocked: false})
            return res.send ({
                message: constants.responseMessages.STORE_UNBLOCKED,
                status: constants.responseFlags.STORE_UNBLOCKED,
                data: {}
            })
        }
        return res.send ({
            message: 'Please enter 0 or 1',
            status: 400,
            data: {}
        })
        }
    catch(error) {
        console.log('Blocked/Unblocked: Something went wrong', error)
        return res.send({
            message: 'Blocked/Unblocked: ' + constants.responseMessages.SOMETHING_WENT_WRONG,
            status: constants.responseFlags.SOMETHING_WENT_WRONG,
            data: {}
        })
    }
}

//------------------------Delete store------------------------------
async function delete_store (req, res) {
try {
    let check_id = await Store.find ({ _id: req.body._id});

        if (_.isEmpty (check_id)){
            return res.send ({
                message: constants.responseMessages.STORE_NOT_FOUND,
                status: constants.responseFlags.STORE_NOT_FOUND,
                data: {}
            })
        }
        if (check_id[0].is_deleted == 1 ){
            return res.send ({
                message: constants.responseMessages.STORE_ALREADY_DELETED,
                status: constants.responseFlags.STORE_ALREADY_DELETED,
                data: {}
            })
        }

        let deleteStore = await Store.update({ _id: check_id[0]._id }, { is_deleted: true });
        if (!_.isEmpty (deleteStore)){
            return res.send ({
                message: constants.responseMessages.STORE_DELETED,
                status: constants.responseFlags.STORE_DELETED,
                data: {}
            })
        }
    }
    catch(error) {
        console.log('Delete store: Something went wrong', error)
        return res.send({
            message: "Delete customer error: "  +constants.responseMessages.SOMETHING_WENT_WRONG,
            status: constants.responseFlags.SOMETHING_WENT_WRONG,
            data: {}
        })
    };
}

//-------------------------Update store----------------------------
async function update_store(req, res) {
    try{
        let check_id = await Store.find ({ _id: req.body.userData._id });

        if (_.isEmpty (check_id)){
            return res.send ({
                message: constants.responseMessages.CUSTOMER_NOT_FOUND,
                status: constants.responseFlags.CUSTOMER_NOT_FOUND,
                data: {}
            })
        }
       
        let opts = {}
        if (req.body.merchant_name){
            opts.merchant_name = req.body.merchant_name
        }
        if (req.body.store_name){
            opts.store_name = req.body.store_name
        }

        let update_detail = await Store.update ({_id: check_id[0]._id}, opts);
        if (_.isEmpty (update_detail)){
            return res.send ({
                message: constants.responseMessages.ERROR_UPDATION_STORE,
                status: constants.responseFlags.ERROR_UPDATION_STORE,
                data: {}
            })
        }
        return res.send ({
            message: constants.responseMessages.PROFILE_UPDATED,
            status: constants.responseFlags.PROFILE_UPDATED,
            data: {opts}
        })
    }
    catch(error) {
        console.log('Update customer: Something went wrong', error)
        return res.send({
            message: 'Update customer error: ' + constants.responseMessages.SOMETHING_WENT_WRONG,
            status: 401,
            data: {}
        })
    };
}

//----------------------------Get all stores--------------------------------
async function get_all_stores (req, res){
    try {
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;

    let checkAllStores = await Store.aggregate([{
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            distanceField: "dist.calculated",
            maxDistance: 20000,        // in meters
            spherical: true,
        },
    }, {
        $match: { is_verify: true, is_blocked: false, is_deleted: false }
    }])
    
        let withoutPasswordDriver = [];
        checkAllStores.forEach((ele) => {
            delete ele.password, delete ele.otp, delete ele.access_token
            withoutPasswordDriver.push(ele);
        })
       return res.send({
           message: constants.responseMessages.STORES_GET_SUCCESSFULLY,
           status: constants.responseFlags.STORES_GET_SUCCESSFULLY,
           data: { withoutPasswordDriver }
       })
    }
    catch(error) {
        console.log('Get stores : Something went wrong', error)
        return res.send({
            message: 'Get stores: ' + constants.responseMessages.SOMETHING_WENT_WRONG,
            status: constants.responseFlags.SOMETHING_WENT_WRONG,
            data: {}
        })
    }
}


module.exports = { register_store, login_store, block_unblock_store, delete_store, update_store, get_all_stores }