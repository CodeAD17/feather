export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, token, authorId } = req.body;

    if (!text || !token || !authorId) {
        return res.status(400).json({ error: 'Missing required fields: text, token, authorId' });
    }

    try {
        // Create post using LinkedIn Share API (v2)
        const postBody = {
            author: `urn:li:person:${authorId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text,
                    },
                    shareMediaCategory: 'NONE',
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
        };

        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(postBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('LinkedIn Post Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.message || 'Failed to post to LinkedIn',
                details: errorData 
            });
        }

        const result = await response.json();
        return res.status(200).json({ 
            success: true, 
            postId: result.id,
            message: 'Posted successfully to LinkedIn!' 
        });
    } catch (error) {
        console.error('LinkedIn Post Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
