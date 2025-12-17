// api/chat.js
// Vercel Serverless Function (CommonJS)

module.exports = async (req, res) => {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  // 2. Load keys
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  if (!apiKey || !assistantId) {
    console.error("Missing API Keys"); 
    return res.status(500).json({ reply: "Configuration Error: API Keys are missing in Vercel Settings." });
  }

  const { message } = req.body;

  try {
    // 3. Send message to OpenAI
    const runResponse = await fetch("https://api.openai.com/v1/threads/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        thread: { messages: [{ role: "user", content: message }] }
      })
    });

    const runData = await runResponse.json();
    if (runData.error) throw new Error(runData.error.message);
    
    const threadId = runData.thread_id;
    const runId = runData.id;

    // 4. Wait for the AI to think
    let status = "queued";
    let attempts = 0;

    while (status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      if (attempts > 30) return res.status(504).json({ reply: "Timeout: AI took too long." });

      const checkResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: { "Authorization": `Bearer ${apiKey}`, "OpenAI-Beta": "assistants=v2" }
      });
      
      const checkData = await checkResponse.json();
      status = checkData.status;
      
      if (status === "failed" || status === "cancelled") {
        throw new Error("AI failed to process the request.");
      }
    }

    // 5. Get the final message
    const msgResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "OpenAI-Beta": "assistants=v2" }
    });

    const msgData = await msgResponse.json();
    let reply = msgData.data[0].content[0].text.value;
    
    // Clean up text
    reply = reply.replace(/【.*?】/g, '');

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("System Error:", error);
    return res.status(500).json({ reply: "System Error: " + error.message });
  }
};
