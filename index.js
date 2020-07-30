var user = require('./users/controllers/userController');
var middle = require ('./middleware/auth');
var driver = require ('./drivers/controllers/driverController');
var product = require ('./products/controllers/productController');
var job = require ('./jobs/controllers/jobController');

//----------------User API's------------------
app.post('/signup', user.register_vendor);
app.post('/verify_otp', user.verify_otp);
app.post('/login', user.login_vendor);
app.post('/forgot_password', user.forgot_password);
app.post('/change_password', middle.verify_token, user.change_password);
app.post('/delete_vendor', user.delete_vendor);
app.post('/update_vendor', middle.verify_token, user.update_vendor);
app.post('/verify_token', middle.verifyToken, user.verify_token);
app.post('/block_unblock_vendor', user.block_unblock_vendor);
app.post('/get_all_drivers', user.get_all_drivers);

//----------------Driver API's------------------
app.post('/signup_driver', driver.register_driver);
app.post ('/verify_otp_driver', driver.verify_otp_driver);
app.post ('/login_driver', driver.login_driver);
app.post('/forgot_password_driver', driver.forgot_password_driver);
app.post ('/change_password_driver', middle.verify_token, driver.change_password_driver);
app.post('/update_driver', middle.verify_token, driver.update_driver);
app.post('/block_unblock_driver', driver.block_unblock_driver);

// ----------------Product API's------------------
app.post('/register_product', product.register_product);
app.post('/get_all_products', product.get_all_products);
app.post('/update_product', product.update_product);
app.post('/block_unblock_product', product.block_unblock_product);

// ----------------Job API's------------------
app.post('/create_order', middle.verify_token, job.create_order);