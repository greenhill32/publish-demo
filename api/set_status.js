// /api/set_status.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Missing status in body' });
  }

  // Configured values for your GitHub repo
  const repoOwner = 'greenhill32';
  const repoName = 'intent-site';
  const filePath = 'status.json';
  const token = process.env.GITHUB_TOKEN;

  // Fetch existing status.json to get SHA
  const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
  const getResponse = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!getResponse.ok) {
    return res.status(500).json({ message: 'Failed to fetch status.json', error: await getResponse.text() });
  }

  const fileData = await getResponse.json();

  // Encode new content
  const newContent = Buffer.from(
    JSON.stringify({ status }, null, 2)
  ).toString('base64');

  // Push new content to GitHub
  const putResponse = await fetch(getUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Update status to ${status}`,
      content: newContent,
      sha: fileData.sha
    })
  });

  if (!putResponse.ok) {
    return res.status(500).json({ message: 'Failed to update status.json', error: await putResponse.text() });
  }

  return res.status(200).json({ message: `Status updated to ${status}` });
}
