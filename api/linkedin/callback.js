export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/linkedin?error=No authorization code provided');
    }

    const CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    
    // Get the actual host from the request headers to ensure URI consistency
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const REDIRECT_URI = `${protocol}://${host}/api/linkedin/callback`;

    console.log('LinkedIn OAuth callback - Redirect URI:', REDIRECT_URI);

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
            return res.redirect(`/linkedin?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        }

        const accessToken = tokenData.access_token;

        // Get user info using OpenID Connect
        const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        // Redirect back to LinkedIn page with token and user info
        const params = new URLSearchParams({
            linkedin_token: accessToken,
            linkedin_name: userData.name || '',
            linkedin_sub: userData.sub || '', // LinkedIn user ID
            linkedin_picture: userData.picture || '',
        });

        return res.redirect(`/linkedin?${params.toString()}`);
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.message);
        return res.redirect(`/linkedin?error=${encodeURIComponent(error.message)}`);
    }
}
