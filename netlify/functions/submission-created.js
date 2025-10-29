// Runs automatically on each Netlify Forms submission (event: submission-created)
// Saves a markdown copy of the submission into content/submissions via GitHub API

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || body;
    const data = payload.data || {};

    // Helper to read a field from multiple possible keys (case-insensitive)
    const getField = (obj, variants) => {
      if (!obj) return '';
      const lowerMap = Object.keys(obj).reduce((acc, k) => { acc[k.toLowerCase()] = obj[k]; return acc; }, {});
      for (const key of variants) {
        const v = lowerMap[key.toLowerCase()];
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
      }
      return '';
    };

    // Try common keys and fall back to payload/body if needed
    const name = getField(data, ['name', 'full_name', 'yourname']) || getField(payload, ['name']);
    const email = getField(data, ['email', 'your_email']) || getField(payload, ['email']);
    const message = getField(data, ['message', 'messages', 'body', 'content']) || getField(payload, ['message', 'body']);

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'AlfredPapa141406';
    const repoName = process.env.GITHUB_REPO_NAME || 'AGP_PORTFOLIO_WITHCMS';
    const branch = process.env.GITHUB_REPO_BRANCH || 'main';

    if (!githubToken) {
      console.log('submission-created: GITHUB_TOKEN not set; skipping save');
      return { statusCode: 200, body: JSON.stringify({ saved: false }) };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = name.replace(/[^a-z0-9\-\_ ]/gi, '').trim().replace(/\s+/g, '-').toLowerCase() || 'anonymous';
    const filename = `content/submissions/${timestamp}-${safeName}.md`;

    const md = `---\nname: "${name.replace(/"/g, '\\"')}"\nemail: "${email.replace(/"/g, '\\"')}"\ndate: "${new Date().toISOString()}"\nform: "${(payload.form_name || 'contact').toString()}"\n---\n\n${(message || '').replace(/---/g, '\\---')}\n\n<!-- raw payload for debugging -->\n\n${JSON.stringify({ data, payload }, null, 2)}\n`;

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Add contact form submission from ${name || 'anonymous'}`,
        content: Buffer.from(md).toString('base64'),
        branch,
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub API error ${putRes.status}: ${errText}`);
    }

    return { statusCode: 200, body: JSON.stringify({ saved: true }) };
  } catch (err) {
    console.error('submission-created error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save submission' }) };
  }
};


