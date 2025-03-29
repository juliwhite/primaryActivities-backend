const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

// const plainPassword = 'password123'; // Replace with the plain text password
// const saltRounds = 10;

// bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('Hashed password:', hash);
//     }
// });

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

// Simulated user database
const usersFile = "./data/users.json";

// Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Read users from the JSON file
    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    } catch (error) {
        return res.status(500).json({ message: "Error reading user data" });
    }

     // Find the user
    const user = users.find((u) => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: "1h",
    });

    res.json({ token, user: { id: user.id, username: user.username } });
});

// Token Validation Route
router.post("/validate-token", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// Default route for /api/auth
// router.get('/', (req, res) => {
//     res.send('Auth API is working!');
// });

module.exports = router;