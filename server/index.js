const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code
        }, {
            headers: {
                Accept: 'application/json'
            }
        });

        const { access_token, error, error_description } = response.data;

        if (error) {
            console.error('GitHub Auth Error:', error, error_description);
            return res.status(400).send(`GitHub Auth Error: ${error_description}`);
        }

        if (access_token) {
            // Redirect back to the frontend with the token
            res.redirect(`http://localhost:5173/github?token=${access_token}`);
        } else {
            res.status(500).send('Failed to retrieve access token');
        }
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
