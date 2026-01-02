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

// GitHub credentials
const GITHUB_CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// LinkedIn credentials
const LINKEDIN_CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

// GitHub OAuth callback
app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
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
            res.redirect(`http://localhost:5173/github?token=${access_token}`);
        } else {
            res.status(500).send('Failed to retrieve access token');
        }
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// LinkedIn OAuth callback
app.get('/api/linkedin/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('http://localhost:5173/linkedin?error=No code provided');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:3000/api/linkedin/callback',
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );

        const tokenData = tokenResponse.data;

        if (tokenData.error) {
            console.error('LinkedIn Auth Error:', tokenData.error, tokenData.error_description);
            return res.redirect(`http://localhost:5173/linkedin?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        }

        const accessToken = tokenData.access_token;

        // Get user info
        const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = userResponse.data;

        // Redirect to LinkedIn page with token
        const params = new URLSearchParams({
            linkedin_token: accessToken,
            linkedin_name: userData.name || '',
            linkedin_sub: userData.sub || '',
            linkedin_picture: userData.picture || '',
        });

        res.redirect(`http://localhost:5173/linkedin?${params.toString()}`);
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
        res.redirect(`http://localhost:5173/linkedin?error=${encodeURIComponent(error.message)}`);
    }
});

// LinkedIn post endpoint
app.post('/api/linkedin/post', async (req, res) => {
    const { text, token, authorId } = req.body;

    if (!text || !token || !authorId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const postBody = {
            author: `urn:li:person:${authorId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text },
                    shareMediaCategory: 'NONE',
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
        };

        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
            },
        });

        res.json({ success: true, postId: response.data.id });
    } catch (error) {
        console.error('LinkedIn Post Error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.message || error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('GitHub Client ID:', GITHUB_CLIENT_ID ? '✓ Set' : '✗ Missing');
    console.log('LinkedIn Client ID:', LINKEDIN_CLIENT_ID ? '✓ Set' : '✗ Missing');
});

