export default async function handler(req, res) {
  console.log("API /chat invoked");

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("Request body:", req.body);

  const { message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  console.log("OpenAI API Key loaded:", !!apiKey);
  console.log("Assistant ID loaded:", !!assistantId);

  if (!apiKey || !assistantId) {
    console.error("Missing env vars:", { apiKey: !!apiKey, assistantId: !!assistantId });
    return res.status(500).json({ error: "Configuration Error: API Keys missing on server." });
  }

  try {
    console.log("Starting OpenAI request...");
    // (your existing fetch logic here)
  } catch (error) {
    console.error("API Error caught:", error);
    return res.status(500).json({
      error: true,
      message: error.message,
      stack: error.stack,
    });
  }
}
