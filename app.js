require('dotenv').config();
var express = require ('express');
var bodyParser = require('body-parser');
app = express();
app.use(express.json());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies]
require ('./index.js')
var port = process.env.port || 3004;
var moment = require ('moment');
var url = require('./config')

//----------Port Listen---------------
app.listen (port, function (){
    var date = moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log('Server is running successfully on port ' + port +' at', date)
})