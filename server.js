
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const mysql = require('mysql2');

// MySQL connection pool
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve everything inside F:\Visual Studio\public
app.use(express.static(path.join(__dirname)));

// Route for homepage (GET request → show portfolio page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "nayum_portfolio.html"));
});

app.post('/api/contact', async (req, res) => {
    console.log("Request body:", req.body);
    const { name, email, subject, message } = req.body;

    // Insert contact data into MySQL
    db.query(
        'INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, email, subject, message],
        (err, results) => {
            if (err) {
                console.error('MySQL error:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
            }
            // Send email after successful DB insert
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS
                }
            });
            transporter.sendMail({
                from: process.env.GMAIL_USER,
                replyTo: email,
                to: process.env.GMAIL_USER,
                subject,
                html: `<p>${message}</p><p>From: ${name} (${email})</p>`
            }, (mailErr, info) => {
                if (mailErr) {
                    console.error('Mail error:', mailErr);
                    return res.status(500).json({ success: false, error: 'Mail error' });
                }
                res.json({ success: true });
            });
        }
    );
});

const PORT = process.env.PORT || 3001;
// Health check route (for testing if server is alive)
app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
