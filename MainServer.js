const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require('bcrypt');
const cors = require('cors');
const { sendVerificationEmail } = require('./emailService');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/school")
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((e) => {
        console.error("Database Connection Error:", e);
    });

require('./UserDetails');
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email is already registered
    try {
        const oldUser = await User.findOne({ email: email });
        if (oldUser) {
            return res.status(400).send({ error: "User already exists" });
        }

        // Check password complexity (example: minimum length)
        if (password.length < 8) {
            return res.status(400).send({ error: "Password must be at least 8 characters long" });
        }

        //! Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(email);
        if (emailSent) {
            res.status(200).send({ message: "User registered successfully. Verification email sent." });
        } else {
            res.status(500).send({ error: "Failed to send verification email" });
        }
    } catch (error) {
        console.error('User registration failed:', error);
        res.status(500).send({ error: "User registration failed", details: error.message });
    }
});

app.post('/check-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        res.send({ exists: !!user }); // Return true if email exists, false otherwise
    } catch (error) {
        res.status(500).send({ error: "Error checking email", details: error.message });
    }
});

app.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;

    try {
        const emailSent = await sendVerificationEmail(email);
        if (emailSent) {
            res.status(200).send({ message: 'Verification email sent successfully' });
        } else {
            res.status(500).send({ error: 'Failed to send verification email' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error sending verification email', details: error.message });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.send({ exists: true, message: "Sign in successful" });
            } else {
                res.send({ exists: false, message: "Incorrect password" });
            }
        } else {
            res.send({ exists: false, message: "Email not registered" });
        }
    } catch (error) {
        res.status(500).send({ error: "An error occurred during sign-in", details: error.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
