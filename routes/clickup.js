const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const router = express.Router();

const CLIENT_ID = "GTCLUVF8MSBD18FOUIQ9A2TGY4IU2CPW";
const CLIENT_SECRET = "IYYFR0GVT7ZAND5LN3VE6TTGSZSKT49BXQV0LXTW9LVWB31BM5MN3IKSLBS7NO2P";
const REDIRECT_URI = "http://localhost:5000/";
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have a secret for JWT

// Utility functions for managing users
const USERS_FILE = path.join(__dirname, "../data/users.json");
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Route to initiate login with Sentry
router.get("/login", (req, res) => {

    const scope = encodeURIComponent("project:read event:read"); // Specify the required scopes
    const loginUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`; //&scope=${scope}
    res.redirect(loginUrl);
});

// Callback route for clickup OAuth
router.get("/", async (req, res) => {
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

        // Extract user details from the token response
        const { data } = tokenResponse; // Assuming tokenResponse contains the structure as given
        console.log(data);

        // Extract user data
        const email = data.user.email;
        const name = data.user.name;

        if (!email) {
            return res.status(500).send("Unable to fetch user email");
        }

        // Check if user exists
        let users = readUsers();
        let user = users.find((u) => u.email === email);
     

        if (!user) {
            // If user doesn't exist, register them
            const newUser = {
                id: users.length + 1,
                email,
                name: name || "New User",
                password: null, // Sentry login users won't have passwords
            };
            users.push(newUser);
            writeUsers(users);
            user = newUser;
        }

        // Create JWT token for the user
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '1h' } // Set the expiration time for the token
        );


        res.send("<html><script>window.localStorage.setItem('token', '"+token+"');window.location.href = 'profile.html';</script></html>")

    } catch (error) {
        console.error("Error during Sentry OAuth:", error.message);
        res.status(500).send("Something went wrong during the OAuth process");
    }
});

module.exports = router;