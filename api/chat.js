// api/chat.js
// DIAGNOSTIC VERSION - Prints errors to the chat window

module.exports = async (req, res) => {
  // 1. Check Request Method
  if (req.method !== 'POST') {
    return res.status(200).json({ reply: "Error: Wrong method. Use POST." });
  }

  try {
    // 2. Check Keys
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!apiKey) {
      return res.status(200).json({ reply: "❌ CRITICAL ERROR: OPENAI_API_KEY is missing from Vercel Settings." });
    }
    if (!assistantId) {
      return res.status(200).json({ reply: "❌ CRITICAL ERROR: OPENAI_ASSISTANT_ID is missing from Vercel Settings." });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(200).json({ reply: "Error: No message received." });
    }

    // 3. Send to OpenAI
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
    
    // Check for OpenAI Errors (like Invalid API Key)
    if (runData.error) {
      return res.status(200).json({ reply: "❌ OpenAI Error: " + runData.error.message });
    }
    
    const threadId = runData.thread_id;
    const runId = runData.id;

    // 4. Wait for AI
    let status = "queued";
    let attempts = 0;

    while (status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      if (attempts > 25) return res.status(200).json({ reply: "⚠️ Timeout: The AI took too long to reply." });

      const checkResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: { "Authorization": `Bearer ${apiKey}`, "OpenAI-Beta": "assistants=v2" }
      });
      
      const checkData = await checkResponse.json();
      status = checkData.status;
      
      if (status === "failed" || status === "cancelled") {
        return res.status(200).json({ reply: "❌ AI Failed: The run was cancelled or failed." });
      }
    }

    // 5. Get Message
    const msgResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "OpenAI-Beta": "assistants=v2" }
    });

    const msgData = await msgResponse.json();
    let reply = msgData.data[0].content[0].text.value;
    reply = reply.replace(/【.*?】/g, '');

    return res.status(200).json({ reply: reply });

  } catch (error) {
    return res.status(200).json({ reply: "❌ SYSTEM CRASH: " + error.message });
  }
};
