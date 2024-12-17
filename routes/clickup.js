const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const CLIENT_ID = "0O3MD4MTETBP5AU5LBJXGLIG9GAS2H2E";
const CLIENT_SECRET = "GYKQZC3QEPLZ6DWJGJ41QJGOFMWXMI7IJ60AZU63380A2GML4DDV1LYC8OPBDYZ3";
const REDIRECT_URI = "https://click-oauth.onrender.com/callback";
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have a secret for JWT

// Utility functions for managing users
const USERS_FILE = path.join(__dirname, "../data/users.json");
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Route to initiate login with ClickUp
router.get("/login", (req, res) => {
    const scope = encodeURIComponent("project:read event:read"); // Specify the required scopes
    const loginUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`; //&scope=${scope}
    res.redirect(loginUrl);
});

// Callback route for ClickUp OAuth
router.get("/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("Authorization code not provided");
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            "https://api.clickup.com/api/v2/oauth/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
            }).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.status(500).send("Failed to retrieve access token");
        }

        // Use access token to fetch user details
        const userResponse = await axios.get("https://api.clickup.com/api/v2/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userData = userResponse.data;

        if (!userData.user || !userData.user.email) {
            return res.status(500).send("Unable to fetch user information");
        }

        // Extract user details
        const userid = userData.user.id;
        const name = userData.user.username;
        const email = userData.user.email;

        // Check if user exists
        let users = readUsers();
        let user = users.find((u) => u.email === email);

        if (!user) {
            // If user doesn't exist, register them
            const newUser = {
                id: userid,
                email,
                name: name || "New User",
                password: null, // ClickUp login users won't have passwords
            };
            users.push(newUser);
            writeUsers(users);
            user = newUser;
        }

        // Create JWT token for the user
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: "1h" } // Set the expiration time for the token
        );
    
        res.send(
            `<html><script>window.localStorage.setItem('token', '${token}');window.location.href = 'profile.html';</script></html>`
        );
    } catch (error) {
        console.error("Error during ClickUp OAuth:", error);
        res.status(500).send("Something went wrong during the OAuth process");
    }
});

module.exports = router;
