const sgMail = require ('@sendgrid/mail');
var Promise = require('bluebird');

function sendMail (options){
    sgMail.setApiKey ('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');
    const msg = {
             to: options.whereCondition.email,
             from: 'ankur.gupta@jungleworks.com',
             subject: 'hello',
             text: 'hello test',
             html: options.whereCondition.otp
    };
    console.log ()
    return new Promise (async (reject, resolve) => {
        try {
            sgMail.send(msg)
            console.log('OTP Sent')
        } catch (error){
          res.send(error.details[0].message)
        }
    })
}

module.exports = {sendMail}

// sgMail.setApiKey ('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');
// const msg = {
//     to: 'ankur.gupta@jungleworks.com',
//     from: 'ankur.gupta@jungleworks.com',
//     subject: 'hello',
//     text: 'hello test',
//     html: "<strong> and easy to do </strong>"
// };

// sgMail.send(msg).then(() => {
//     console.log('Message sent')
// }).catch((error) => {
//     console.log(error.response.body)
//     console.log(error.response.body.errors[0].message)
// })