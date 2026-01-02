export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/github?error=No authorization code provided');
    }

    const CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    const REDIRECT_URI = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/linkedin/callback`;

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('LinkedIn Auth Error:', tokenData.error, tokenData.error_description);
            return res.redirect(`/github?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        }

        const accessToken = tokenData.access_token;

        // Get user info using OpenID Connect
        const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        // Redirect back to frontend with token and user info
        const params = new URLSearchParams({
            linkedin_token: accessToken,
            linkedin_name: userData.name || '',
            linkedin_sub: userData.sub || '', // LinkedIn user ID
            linkedin_picture: userData.picture || '',
        });

        return res.redirect(`/github?${params.toString()}`);
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.message);
        return res.redirect(`/github?error=${encodeURIComponent(error.message)}`);
    }
}
