const mongoose = require ('mongoose');
var url = 'mongodb://localhost:27017/food_order';

mongoose.connect (url, { useUnifiedTopology: true, useNewUrlParser: true },(error) => {
    if (error) {
        console.log ('Error in connecting database')
    }
    else {
        console.log ('Database connected succesfully')
    }
});

module.exports = { url }
