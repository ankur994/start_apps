var user = require('./users/controllers/userController');
var middle = require ('./middleware/auth');
var driver = require ('./drivers/controllers/driverController')

//----------------User API's------------------
app.post('/signup', user.register_user);
app.post('/verify_otp', user.verify_otp);
app.post('/login', user.login_user);
app.post('/forgot_password', user.forgot_password);
app.post('/change_password', middle.verify_token, user.change_password);
app.post('/delete_user', user.delete_user);
app.post('/update_user', middle.verify_token, user.update_user);
app.post('/verify_token', middle.verifyToken, user.verify_token);

//----------------Driver API's------------------
app.post('/signup_driver', driver.register_driver);
app.post ('/login_driver', driver.login_driver);
app.post ('/verify_otp_driver', driver.verify_otp_driver);
app.post('/forgot_password_driver', driver.forgot_password_driver);
app.post ('/change_password_driver', middle.verify_token, driver.change_password_driver)