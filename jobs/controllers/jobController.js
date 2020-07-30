var Promise = require('bluebird');
var _ = require('underscore');
var Product = require('../../models/product');
var Order = require('../../models/jobs');
var User = require ('../../models/user');
var url = require ('../../config');
const secretKey = process.env.JWT_KEY = 'secret';
var mongoose = require ('mongoose');

//-----------------Create Order------------------------
function create_order(req, res) {
    Promise.coroutine (function *(){
        let checkUser = yield User.find({
            _id: req.body.userData._id
        })
        if (_.isEmpty (checkUser)){
            return res.send ({
                message: 'No vendor found',
                status: 400,
                data: {}
            })
        }
        let checkProduct = yield Product.find ({
            _id: req.body._id
        })
        if (_.isEmpty (checkProduct)){
            return res.send ({
                message: 'No product found',
                status: 400,
                data: {}
            })
        }
        if (checkProduct[0].product_quantity < 1){
            return res.send ({
                message: 'Product is out of stock',
                status: 400,
                data: {}
            })
        }
        if (checkProduct[0].is_blocked == true){
            return res.send ({
                message: 'Product is blocked',
                status: 400,
                data: {}
            })
        }
        if (checkProduct[0].is_available == false){
            return res.send ({
                message: 'Product is not available',
                status: 400,
                data: {}
            })
        }
        let order = yield Order.create ({
            // _id: new mongoose.Types.ObjectId,
            _id: req.body._id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            customer_address: req.body.customer_address,
            product_quantity: req.body.product_quantity
        })
        if(!_.isEmpty (order)){
            return res.send ({
                message: 'Order created successfully',
                status: 200,
                data: {order}
            })
        }
        return res.send ({
            message: 'Order not created',
            status: 400,
            data: {}
        })
    })
    ().catch((error) => {
        console.log('Create order: Something went wrong', error)
        return res.send({
            "message": "Create order error: Something went wrong",
            "status": 401,
            "data": {}
        })
    });
}
module.exports =  { create_order }