const nodemailer = require('nodemailer');

async function sendVerificationEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'srikanthvarma6070@gmail.com',
            pass: 'bhyghgnklqymnxwz'
        },
        logger: true, // Enable logging
        debug: true // Include SMTP traffic in the logs
    });

    const mailOptions = {
        from: 'srikanthvarma6070@gmail.com',
        to: email,
        subject: 'Fresh Registration to Gift of Giving',
        text: `Hi, I'm an Employee from Gift of Giving. Thanks for registering to our website and helping people who're in need, orphanages, and old-age homes. We appreciate your spirit for donating. Be a Donor.`
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = { sendVerificationEmail };
