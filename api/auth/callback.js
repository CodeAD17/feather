export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    const CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('GitHub Auth Error:', data.error, data.error_description);
            return res.redirect(`/github?error=${encodeURIComponent(data.error_description)}`);
        }

        if (data.access_token) {
            // Redirect back to the frontend with the token
            return res.redirect(`/github?token=${data.access_token}`);
        } else {
            return res.redirect('/github?error=Failed to get access token');
        }
    } catch (error) {
        console.error('Server Error:', error.message);
        return res.redirect(`/github?error=${encodeURIComponent(error.message)}`);
    }
}
