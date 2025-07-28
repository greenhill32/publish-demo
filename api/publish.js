export default async (request, response) => {
  // This Vercel Function simulates publishing a post to a social media platform.
  // In a real application, this would interact with a social media API (e.g., X, Facebook).

  if (request.method === 'POST') {
    const { platform, content, media_url } = request.body; // Data sent by the AI agent

    console.log(`Simulating post to ${platform}: "${content}"`);
    if (media_url) {
      console.log(`(with media: ${media_url})`);
    }

    // Simulate a successful response
    response.status(200).json({
      status: "success",
      message: `Post successfully simulated for ${platform}. Content: "${content.substring(0, 50)}..."`,
      post_id: `mock-post-${Date.now()}` // A unique ID for the simulated post
    });
  } else {
    // If it's not a POST request, tell them how to use it.
    response.status(405).json({
      status: "error",
      message: "This endpoint only accepts POST requests for publishing content."
    });
  }
};