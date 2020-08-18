var Promise = require('bluebird');
var _ = require('underscore');
var Product = require('./../../models/product');
var url = require ('./../../config');
var mongoose = require ('mongoose');

//-----------------Product register-------------------------
function register_product(req, res) {
    Promise.coroutine (function *(){

        let registerProduct = yield Product.create ({
            // _id: new mongoose.Types.ObjectId,
            product_name: req.body.product_name,
            product_price: req.body.product_price,
            product_quantity: req.body.product_quantity
        })
        if (_.isEmpty (registerProduct)){
            return res.send ({
                message: 'Error in adding product',
                status: 400,
                data: {}
            })
        }
        return res.send({
            message: 'Product added successfully',
            status: 200,
            data: { registerProduct }
        })
    })
    ().catch((error) => {
        console.log('Register product: Something went wrong', error)
        return res.send({
            "message": "Register error: Something went wrong",
            "status": 401,
            "data": {}
        })
    });
}

//-----------------Product details-------------------------
function get_all_products(req, res) {
    Promise.coroutine (function *(){

        let opts = {};
        if (req.body.is_available) {
            opts.is_available = req.body.is_available;
        }
        if (req.body.is_blocked) {
            opts.is_blocked = req.body.is_blocked;
        }
        if (req.body.is_deleted) {
            opts.is_deleted = req.body.is_deleted;
        }
      
        let checkProduct = yield Product.find (opts);
       
        if (_.isEmpty (checkProduct)){
            return res.send ({
                message: 'No product found',
                status: 400,
                data: {}
            })
        }
        
        return res.send ({
            message: 'Success',
            status: 200,
            data: {checkProduct}
        })
    })
    ().catch((error) => {
        console.log('Get Products: Something went wrong', error)
        return res.send({
            "message": 'Get Products error: Something went wrong',
            "status": 401,
            "data": {}
        })
    });
}

//-----------------Update product details-------------------------
function update_product(req, res) {
    Promise.coroutine(function* () {
            let checkProduct = yield Product.find({ _id: req.body._id })
            if (_.isEmpty(checkProduct)) {
                return res.send({
                    message: 'No product found',
                    status: 400,
                    data: {}
                })
            }
            let opts = {};
            if (req.body.product_name) {
                opts.product_name = req.body.product_name;
            }
            if (req.body.product_price) {
                opts.product_price = req.body.product_price;
            }
            if (req.body.product_quantity) {
                opts.product_quantity = req.body.product_quantity;
            }
            let update_detail = yield Product.update({_id: req.body._id}, opts);
            if (_.isEmpty(update_detail)) {
                return res.send({
                    message: 'Error in updating product',
                    status: 400,
                    data: {}
                })
            }
            return res.send({
                message: 'Product updated successfully',
                status: 200,
                data: {opts}
            })
        })
        ().catch((error) => {
            console.log('Product: Something went wrong', error)
            return res.send({
                "message": 'Product error: Something went wrong',
                "status": 401,
                "data": {}
            })
        });
}

//------------------------Block/Unblock product-----------------------------
function block_unblock_product (req, res) {
    Promise.coroutine (function *() {
        let checkProduct = yield Product.find ({
            _id: req.body._id
        })
        if (_.isEmpty (checkProduct)){
            return res.send ({
                message: 'Product not found',
                status: 400,
                data: {}
            })
        }
        let is_blocked = req.body.is_blocked;

        if (is_blocked == '1'){
        yield Product.update ({_id: checkProduct[0]._id},{is_blocked: true})
            return res.send ({
                message: 'Product blocked successfully',
                status: 200,
                data: {}
            })
        }
        if (is_blocked == '0'){
        yield Product.update ({_id: checkProduct[0]._id},{is_blocked: false})
            return res.send ({
                message: 'Product unblocked successfully',
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

//------------------------Delete product-----------------------------
function delete_product (req, res) {
    Promise.coroutine (function *(){
        
        let deleteProduct = yield Product.update({ _id: req.body._id }, { is_deleted: true });
        if (!_.isEmpty (deleteProduct)){
            return res.send ({
                message: 'Deleted succesfully',
                status: 200,
                data: {}
            })
        }
    })
    ().catch((error) => {
        console.log('Delete product: Something went wrong', error)
        return res.send({
            message: "Delete product error: Something went wrong",
            status: 401,
            data: {}
        })
    });
}
module.exports = { register_product, get_all_products, update_product, block_unblock_product, delete_product }






//---------------------Update product-----------------------
// function update_product(req, res) {
//     Promise.coroutine(function* () {
//             let checkProduct = yield Product.find({
//                 _id: req.body._id
//             })
//             if (_.isEmpty(checkProduct)) {
//                 return res.send({
//                     message: 'No product found',
//                     status: 400,
//                     data: {}
//                 })
//             }
//             Product.findOne({
//                 _id: req.body._id
//             }, function (error, opts) {
//                 if (error) {
//                     console.log(error);
//                     res.status(500).send();
//                 } else {
//                     if (!opts) {
//                         res.status(500).send();
//                     } else {
//                         if (req.body.product_name) {
//                             opts.product_name = req.body.product_name;
//                         }
//                         if (req.body.product_price) {
//                             opts.product_price = req.body.product_price;
//                         }
//                         if (req.body.product_quantity) {
//                             opts.product_quantity = req.body.product_quantity;
//                         }
//                         opts.save(function (error, updatedObject) {
//                             if (error) {
//                                 res.status(500).send();
//                             }
//                             res.send(updatedObject)
//                         })
//                     }
//                 }
//             })

//         })
//         ().catch((error) => {
//             console.log('Product: Something went wrong', error)
//             return res.send({
//                 "message": 'Product error: Something went wrong',
//                 "status": 401,
//                 "data": {}
//             })
//         });
// }


// function update_product(req, res) {
//     Promise.coroutine(function* () {
//             let checkProduct = yield Product.find({
//                 _id: req.body._id
//             })
//             if (_.isEmpty(checkProduct)) {
//                 return res.send({
//                     message: 'No product found',
//                     status: 400,
//                     data: {}
//                 })
//             }
//             Product.findOne({
//                     _id: req.body._id
//                 },
//                 function (error, opts) {
//                     if (error) {
//                         return res.send({
//                             message: 'Something went wrong',
//                             status: 400,
//                             data: {
//                                 error
//                             }
//                         })
//                     } else {
//                         if (!opts) {
//                             return res.send({
//                                 message: 'Something went wrong',
//                                 status: 400,
//                                 data: {}
//                             })
//                         } else {
//                             if (req.body.product_name) {
//                                 opts.product_name = req.body.product_name;
//                             }
//                             if (req.body.product_price) {
//                                 opts.product_price = req.body.product_price;
//                             }
//                             if (req.body.product_quantity) {
//                                 opts.product_quantity = req.body.product_quantity;
//                             }
//                             opts.save(function (error, updatedObject) {
//                                 if (error) {
//                                     return res.send({
//                                         message: 'Error in updating product',
//                                         status: 200,
//                                         data: {}
//                                     })
//                                 }
//                                 return res.send({
//                                     message: 'Product updated successfully',
//                                     status: 200,
//                                     data: {
//                                         updatedObject
//                                     }
//                                 })
//                             })
//                         }
//                     }
//                 })
//         })
//         ().catch((error) => {
//             console.log('Product: Something went wrong', error)
//             return res.send({
//                 "message": 'Product error: Something went wrong',
//                 "status": 401,
//                 "data": {}
//             })
//         });
// }
