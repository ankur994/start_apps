var user = require('./users/controllers/userController');
var middle = require ('./middleware/auth');
var driver = require ('./drivers/controllers/driverController')

//----------------User API's------------------
app.post('/signup', user.register_vendor);
app.post('/verify_otp', user.verify_otp);
app.post('/login', user.login_vendor);
app.post('/forgot_password', user.forgot_password);
app.post('/change_password', middle.verify_token, user.change_password);
app.post('/delete_vendor', user.delete_user);
app.post('/update_vendor', middle.verify_token, user.update_vendor);
app.post('/verify_token', middle.verifyToken, user.verify_token);
app.post('/block_unblock_vendor', user.block_unblock_vendor);

//----------------Driver API's------------------
app.post('/signup_driver', driver.register_driver);
app.post ('/verify_otp_driver', driver.verify_otp_driver);
app.post ('/login_driver', driver.login_driver);
app.post('/forgot_password_driver', driver.forgot_password_driver);
app.post ('/change_password_driver', middle.verify_token, driver.change_password_driver);
app.post('/update_driver', middle.verify_token, driver.update_driver);
app.post('/block_unblock_driver', driver.block_unblock_driver);