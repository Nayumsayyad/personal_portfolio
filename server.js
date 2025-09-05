require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const mysql = require('mysql2');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// MySQL connection pool (optional)
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Homepage (serve your portfolio HTML)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nayum_portfolio.html"));
});

// ✅ Contact form route
app.post('/api/contact', (req, res) => {
  console.log("Request body:", req.body);
  const { name, email, subject, message } = req.body;

  // Try saving to DB (doesn't block email)
  db.query(
    'INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())',
    [name, email, subject, message],
    (err) => {
      if (err) console.error('MySQL error:', err);
    }
  );

  // Setup Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  // Send email
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
});

// ✅ Health check
app.get("/health", (req, res) => res.send("OK"));

// ✅ Port binding
// Use 8080 locally, but still Render-compatible with process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
