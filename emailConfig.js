const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: 'services@qubicgen.com',
            pass: "ktd865^&#%Q"
        }
    });
};

// Create and verify transporter
const transporter = createTransporter();

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready');
    }
});

module.exports = transporter;