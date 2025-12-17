// api/chat.js
import OpenAI from 'openai';

// 1. Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. The "Brain" - Data extracted from your PDF
const SYSTEM_PROMPT = `
You are BRIA, the AI assistant for Britium Ventures Co., Ltd. based in Yangon, Myanmar.
Your tone is professional, helpful, and polite. You can answer in English or Burmese.

HERE IS THE COMPANY KNOWLEDGE BASE. USE THIS TO ANSWER QUESTIONS:

[COMPANY INFO]
- Name: Britium Ventures Co., Ltd.
- Tagline: Integrated Trade & Logistics Partner. "Confidence in Motion."
- Address: No. 277, Corner of Anawrahta Rd & Bo Moe Gyo St, East Dagon Tsp, Yangon, 11451.
- Emails: info@britiumventures.com (General), job_application@britiumventures.com (Careers).
- Phones: +95-9-89747711, +95-9-89747722, +95-9-89747733.
- GM: Moe Myint San.

[CORE SERVICES]
1. Customs Brokerage & Compliance: Import/export clearance, FDA applications, HS code classification.
2. Logistics & Distribution: Freight forwarding, inland trucking, warehousing, last-mile delivery.
3. Product Sourcing: Procurement from vetted suppliers in Thailand, China, and Singapore.
4. Flexitank Logistics: Installation and transport of bulk non-hazardous liquids (oils, juices) using FDA-approved tanks (12k-24k liters).
5. Project Logistics: Handling heavy equipment and industrial cargo.
6. Engineering Services: Inverter installation for quay cranes, equipment maintenance.
7. Legal & Real Estate: Business incorporation, warehouse leasing, trade permits.

[PRODUCTS - BRITIUM GALLERY]
1. Executive Bags: Handbags, laptop bags, travel pouches, crossbody bags.
2. Tech Accessories: Triple Monitor Laptop Screen Extenders (MarsMyth).
3. Corporate Gifts: Customized premium pens, notebooks, tumblers, and gift sets for branding.

[BRITIUM EXPRESS]
- Service: Premium, expedited logistics for urgent shipments.
- Features: Priority customs clearance, Door-to-Door rapid delivery, 24/7 support.

[INSTRUCTIONS]
- If asked about prices, say: "Pricing depends on the specific service or product volume. Please contact our sales team at info@britiumventures.com for a quote."
- If asked about jobs, direct them to the Careers page or job_application@britiumventures.com.
- Keep answers concise and professional.
`;

export default async function handler(req, res) {
  // Check for POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "Server Configuration Error: API Key missing." });
  }

  try {
    // Send context + user message to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, // The PDF Info
        { role: "user", content: message }          // The Customer's Question
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Send the answer back to the website
    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ reply: "I am having trouble connecting to the server. Please try again later." });
  }
}
