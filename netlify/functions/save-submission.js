const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // This function will be triggered by Netlify Forms webhook
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);
    const { name, email, message } = formData;

    // Get GitHub token from environment
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.log('GITHUB_TOKEN not configured - submission logged but not saved to repo');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Form received. Configure GITHUB_TOKEN to auto-save to CMS.' })
      };
    }

    const repoOwner = 'AlfredPapa141406';
    const repoName = 'AGP_PORTFOLIO_WITHCMS';
    const branch = 'main';

    // Create filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `content/submissions/${timestamp}.md`;

    // Create markdown content
    const content = `---
name: "${name.replace(/"/g, '\\"')}"
email: "${email.replace(/"/g, '\\"')}"
date: "${new Date().toISOString()}"
---

${message.replace(/---/g, '\\---')}
`;

    // Use GitHub API to create file
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `Add contact form submission from ${name}`,
        content: Buffer.from(content).toString('base64'),
        branch: branch
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission saved to CMS successfully' })
    };
  } catch (error) {
    console.error('Error saving submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving submission', error: error.message })
    };
  }
};
