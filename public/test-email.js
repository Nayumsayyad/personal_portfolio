const nodemailer = require('nodemailer');

console.log('Creating transporter...');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nayumsayyad35@gmail.com',
        pass: 'qyfu ealh mrvc ieal'
    }
});

console.log('Sending email...');
transporter.sendMail({
    from: '"Test" <nayumsayyad35@gmail.com>',
    to: 'nayumsayyad35@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email from Node.js'
}, (err, info) => {
    if (err) {
        return console.log('Error:', err);
    }
    console.log('Email sent:', info.response);
    process.exit();
});

// Add a timeout in case it hangs
setTimeout(() => {
    console.log('Timeout: No response from Gmail after 15 seconds.');
    process.exit(1);
}, 15000);