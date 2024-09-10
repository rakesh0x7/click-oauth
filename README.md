# OAuth Node.js Application

This is a simple OAuth authentication app using Node.js, Express, and Axios. The app interacts with Zenkit's OAuth 2.0 authentication flow.

## Prerequisites

Before running the app, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Ngrok](https://ngrok.com/)

## Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/rakesh0x7/OAuth-app/
cd OAuth-app
```
		
### Step 2: Install dependencies

Run the following command to install the required dependencies:

`npm install` 

### Step 3: Create `.env` file

Create a `.env` file in the root of the project and add the following environment variables:

`CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=your_redirect_uri` 

Replace `your_client_id`, `your_client_secret`, and `your_redirect_uri` with the actual values from your OAuth provider.

### Step 4: Run the app

Start the Node.js application by running:

`node server.js` 

The server will run at `http://localhost:3000`.

### Step 5: Use Ngrok for external access

To expose the server for external access using Ngrok (u should have an ngrok account follow this [docs](https://ngrok.com/docs/getting-started/#step-2-connect-your-account)), open a new terminal and run the following command:

`ngrok http 3000` 

Ngrok will provide you with a public URL. Use this URL as the `REDIRECT_URI` in the `.env` file.

Example:

`REDIRECT_URI=https://your-ngrok-url/callback` 

### Step 6: Access the app

-   Navigate to `http://localhost:3000` or your Ngrok URL `https://your-ngrok-url/` in a web browser.

## Logging

Logs are stored in the `oauth.log` file located in the root of the project. The logs will include information about OAuth authentication and errors.
