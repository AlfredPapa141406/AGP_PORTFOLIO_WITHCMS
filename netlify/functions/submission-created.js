// Runs automatically on each Netlify Forms submission (event: submission-created)
// Saves a markdown copy of the submission into content/submissions via GitHub API

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || body;
    const data = payload.data || {};

    const name = (data.name || '').toString();
    const email = (data.email || '').toString();
    const message = (data.message || '').toString();

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

    const md = `---\nname: "${name.replace(/"/g, '\\"')}"\nemail: "${email.replace(/"/g, '\\"')}"\ndate: "${new Date().toISOString()}"\n---\n\n${message.replace(/---/g, '\\---')}\n`;

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


