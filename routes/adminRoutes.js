
const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const router = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET);

        admin.token = token;
        await admin.save();

        res.status(200).json({ message: 'Login successful', token ,username});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
router.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Admin.findOne({ username: decoded.username, token }); // Ensure token matches DB

        if (user) {
            return res.status(200).json({ isAuthenticated: true });
        } else {
            return res.status(401).json({ isAuthenticated: false });
        }
    } catch (error) {
        return res.status(401).json({ isAuthenticated: false });
    }
});

router.post('/create', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this username already exists" });
        }

        const newAdmin = new Admin({ username, password });
        await newAdmin.save();

        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
