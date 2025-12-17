// api/chat.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant for logistics and trade." },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorBody);
      return res.status(502).json({ error: "AI service error" });
    }

    const openaiData = await openaiResponse.json();

    const reply = openaiData.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.warn("No reply from AI", openaiData);
      return res.status(500).json({ error: "No response from AI" });
    }

    return res.status(200).json({ reply });

} catch (error) {
  console.error("API Error:", error);
  return res.status(500).json({
    error: true,
    message: error.message,
    stack: error.stack
  });
}

  }
}
