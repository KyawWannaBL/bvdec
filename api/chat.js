// api/chat.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- LITE VERSION (Fits strict rate limits) ---
const SYSTEM_PROMPT = `
You are BRIA, the AI for Britium Ventures Co., Ltd. (Yangon, Myanmar).
Tone: Professional, helpful, concise.

[COMPANY INFO]
- Address: No. 277, East Dagon Tsp, Yangon.
- Contact: info@britiumventures.com | +95-9-89747711.
- Services: Logistics, Customs, Trading.

[PRODUCT OVERVIEW]
1. FASHION BAGS:
   - Executive Series (BVOSBG): 50,000 - 110,000 MMK. (Includes Crossbody, Totes, Hobos).
   - Premium Series (BVBCFC): 168,000 - 285,000 MMK. (Branded styles like Coach/Dior/LV inspired).
   - *Note: For specific item prices, refer user to the catalog on the page.*

2. SCREEN EXTENDERS (MarsMyth):
   - Portable tri-screen monitors for laptops.
   - Models: AS780 (14"), AS880 (16"). 
   - Plug & Play (USB-C/HDMI).

3. FLEXITANKS (Liquiride):
   - 16k-26k Liters for bulk non-hazardous liquids (Oil, Juice).
   - Rail Impact Tested & FDA approved.

4. CORPORATE GIFTS:
   - Executive sets (Notebook + Pen + Smart Tumbler).

[INSTRUCTIONS]
- Answer brief questions.
- If asked for specific prices not listed here, ask them to check the product card or contact sales.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method Not Allowed' });

  try {
    const { message } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      // Lower max_tokens to save space
      max_tokens: 150, 
      temperature: 0.7,
    });

    return res.status(200).json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error("OpenAI Error:", error);
    // Send a polite fallback message if limit is hit again
    return res.status(200).json({ reply: "I'm receiving too many messages right now. Please contact us at info@britiumventures.com for immediate assistance." });
  }
}
