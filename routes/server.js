require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const winston = require('winston');

const app = express();
const PORT = 3000;

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'oauth.log', level: 'info' })
    ]
});

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Step 1: Redirect to Zenkit's OAuth page
app.get('/login', (req, res) => {
    const state = Math.random().toString(36).substring(7);  // random state for security
    const authorizationURL = `https://app.clickup.com/api?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}`;
    
    // Log the state and user info
    logger.info('Redirecting user to Zenkit OAuth page', { authorizationURL });

    res.redirect(authorizationURL);
});

// Step 2: Callback route to handle the response from Zenkit OAuth
app.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;
    const state = req.query.state;

    if (!authorizationCode) {
        return res.send('Error: No authorization code returned from Zenkit.');
    }

    try {
        // Exchange authorization code for access token
        // https://api.clickup.com/api/v2/oauth/token?client_id=string&client_secret=string&code=string'
        // const response = await axios.post(' https://api.clickup.com/api/v2/oauth/token', {
        //     grant_type: 'authorization_code',
        //     code: authorizationCode,
        //     client_id: process.env.CLIENT_ID,
        //     client_secret: process.env.CLIENT_SECRET,
        //     redirect_uri: process.env.REDIRECT_URI
        // });
        logger.info('oauth code xx ,:', {authorizationCode});

        // const { access_token, refresh_token, expires_in } = response.data;

        // // Log the OAuth data
        // logger.info('OAuth token exchange successful', {
        //     access_token,
        //     refresh_token,
        //     expires_in,
        //     state
        // });

        // res.json({
        //     message: 'Authentication successful!',
        //     access_token,
        //     refresh_token,
        //     expires_in
        // });

    } catch (error) {
        logger.error('Error exchanging authorization code for access token', { error: error.message });
        res.status(500).send('Error exchanging authorization code for access token: ' + error.message);
    }
});

// // Step 3: Refresh the access token
// app.post('/refresh-token', async (req, res) => {
//     const refreshToken = req.body.refresh_token;

//     try {
//         const response = await axios.post('https://zenkit.com/api/v1/oauth/token', {
//             grant_type: 'refresh_token',
//             refresh_token: refreshToken,
//             client_id: process.env.CLIENT_ID,
//             client_secret: process.env.CLIENT_SECRET
//         });

//         const { access_token, expires_in } = response.data;

//         // Log the refreshed access token
//         logger.info('Token refreshed successfully', {
//             access_token,
//             refresh_token: refreshToken,
//             expires_in
//         });

//         res.json({
//             message: 'Token refreshed successfully!',
//             access_token,
//             expires_in
//         });

//         res.redirect('https://app.zenkit.com/home');

//     } catch (error) {
//         logger.error('Error refreshing access token', { error: error.message });
//         res.status(500).send('Error refreshing access token: ' + error.message);
//     }
// });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
