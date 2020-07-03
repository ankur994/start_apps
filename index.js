var user = require('./users/controllers/userController');
var middle = require ('./middleware/auth');

//----------------User API's------------------
app.post('/signup', user.register_user);
app.post('/verify_otp', user.verify_otp);
app.post('/login', user.login_user);
app.post('/forgot_password', user.forgot_password);
app.post('/change_password', middle.verify_token, user.change_password);
app.post('/delete_user', user.delete_user);
app.post('/update_user', middle.verify_token, user.update_user);
app.post('/verify_token', middle.verifyToken, user.verify_token);