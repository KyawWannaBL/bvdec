// api/chat.js
import OpenAI from 'openai';

// 1. Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. THE BRAIN (Company Data)
const SYSTEM_PROMPT = `
IMPORTANT INSTRUCTION: You are BRIA, the official AI assistant for "Britium Ventures Co., Ltd."
You are NOT discussing a fictional entity. Britium Ventures is a real logistics company in Myanmar.

[COMPANY PROFILE]
- Name: Britium Ventures Co., Ltd.
- Tagline: Integrated Trade & Logistics Partner. "Confidence in Motion."
- Address: No. 277, Corner of Anawrahta Rd & Bo Moe Gyo St, East Dagon Tsp, Yangon, 11451.
- General Manager: Moe Myint San.
- Emails: info@britiumventures.com, job_application@britiumventures.com.
- Phones: +95-9-89747711 through 44.

[SERVICES]
1. Customs Brokerage & FDA: Import/export clearance, regulatory compliance.
2. Logistics: Freight forwarding, inland trucking, warehousing.
3. Flexitank Logistics: Installation of tanks for bulk liquids (oils, juices) - 12k-24k liters.
4. Project Logistics: Heavy machinery and infrastructure projects.
5. Britium Express: Premium expedited delivery for urgent shipments.
6. Product Sourcing: Sourcing from Thailand, China, Singapore.

[PRODUCTS]
- Executive Bags (Handbags, laptop bags)
- "MarsMyth" Triple Monitor Laptop Screens
- Corporate Gifts (Pens, tumblers, notebooks)

[RULES]
- Answer in English or Burmese.
- Be professional and polite.
- If you don't know the answer, say: "Please contact our team at info@britiumventures.com."
`;

export default async function handler(req, res) {
  // A. Check Request Method
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  // B. Check API Key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "Server Error: API Key is missing." });
  }

  try {
    const { message } = req.body;

    // C. Send to OpenAI with the System Prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // THIS IS THE CRITICAL PART - DO NOT REMOVE
        { role: "system", content: SYSTEM_PROMPT }, 
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ reply: "Connection error. Please try again." });
  }
}
