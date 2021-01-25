// const sgMail = require ('@sendgrid/mail');
// var Promise = require('bluebird');

// function sendMail (options){
//     sgMail.setApiKey ('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');
//     const msg = {
//              to: options.email,
//              from: 'ankur.gupta@jungleworks.com',
//              subject: 'hello',
//              text: 'hello test',
//              html: options.otp
//     };
//     return new Promise (async (reject, resolve) => {
//         try {
//             sgMail.send(msg)
//             console.log('OTP Sent')
//         } catch (error){
//           res.send(error.details[0].message)
//         }
//     })
// }

// module.exports = {sendMail}

// // sgMail.setApiKey ('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');
// // const msg = {
// //     to: 'ankur.gupta@jungleworks.com',
// //     from: 'ankur.gupta@jungleworks.com',
// //     subject: 'hello',
// //     text: 'hello test',
// //     html: "<strong> and easy to do </strong>"
// // };

// // sgMail.send(msg).then(() => {
// //     console.log('Message sent')
// // }).catch((error) => {
// //     console.log(error.response.body)
// //     console.log(error.response.body.errors[0].message)
// // })

var Promise = require('bluebird');
const nodemailer = require("nodemailer");

function sendMail (options){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ankurgupta194@gmail.com', 
            pass: ''
           }
       });

       const mailOptions = {
        from: 'ankurgupta194@gmail.com', 
        to: options.email, 
        subject: 'Subject of your email',
        text: 'Node.js testing mail for GeeksforGeeks'
    };
transporter.sendMail(mailOptions,(err, data) => { 
	if(err) { 
		console.log('Error Occurs', err); 
	} else { 
		console.log('Email sent successfully'); 
	} 
})
}; 

module.exports = {sendMail};