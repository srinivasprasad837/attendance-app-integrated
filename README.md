# attendance-app-integrated

## Description

This is a simple attendance tracking application. The user interface is built using React, the backend is developed with Node.js, and MongoDB is used as the database.

## How to Run

### Development Mode

1.  **Backend Development:**
    ```bash
    npm run dev
    ```
    This command starts only the backend server in development mode.

2.  **Frontend Development Build:**
    ```bash
    npm run dev-build
    ```
    This command first navigates to the UI directory, builds the React frontend, copies the built frontend files to the `public` folder in the backend, and then starts the Node.js server. This serves the frontend from the backend server in development mode.

### Release Build

For release builds, typically used in automated pipelines:
```bash
npm run release-build
```
This command performs a similar process to `npm run dev-build`, but with the following additional steps:

- It also runs `npm install` to ensure all dependencies are installed before building.
- It is designed for automated build pipelines and prepares the application for release.


## Environment Variables

The following environment variables are required to run this application:

-   `MONGODB_URI`:  The URI for your MongoDB database.
-   `TELEGRAM_BOT_TOKEN`: The token for your Telegram bot.
-   `TELEGRAM_CHAT_ID`: The chat ID for your Telegram channel.
-   `VALID_ACCESS_TOKEN`:  A valid access token for authentication.

**To set these environment variables:**

You can set these variables in your `.env` file in the root directory of the project, or directly in your environment.

**Example `.env` file:**
```
MONGODB_URI=your_mongodb_uri_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
VALID_ACCESS_TOKEN=your_valid_access_token_here
```

**Note:**  Replace the placeholder values with your actual values.
# attendance-app-integrated
