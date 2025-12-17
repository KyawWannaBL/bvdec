// api/chat.js
// This runs on Vercel's serverless environment

import OpenAI from 'openai';

// 1. Initialize OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This pulls from your Vercel Settings
});

// 2. The "Brain" - Company Data & Rules extracted from your PDF
const SYSTEM_PROMPT = `
You are BRIA, the AI assistant for Britium Ventures Co., Ltd. based in Yangon, Myanmar.
Your tone is professional, helpful, polite, and confident. 
You can answer in English or Burmese.

[COMPANY PROFILE]
- [cite_start]Name: Britium Ventures Co., Ltd. [cite: 1]
- Tagline: Integrated Trade & Logistics Partner. [cite_start]"Confidence in Motion." [cite: 2]
- [cite_start]Address: No. 277, Corner of Anawrahta Rd & Bo Moe Gyo St, East Dagon Tsp, Yangon, 11451. [cite: 3]
- [cite_start]General Manager: Moe Myint San. [cite: 577]
- [cite_start]Contact Emails: info@britiumventures.com (General), job_application@britiumventures.com (Careers). [cite: 3]
- [cite_start]Contact Phones: +95-9-89747711, +95-9-89747722, +95-9-89747733, +95-9-89747744. [cite: 4]

[CORE LOGISTICS SERVICES]
1. [cite_start]Customs Brokerage & FDA: Import/export clearance, HS code classification, FDA applications, regulatory compliance. [cite: 11]
2. [cite_start]Logistics & Distribution: Freight forwarding (Land, Sea, Air), inland trucking, warehousing, inventory management. [cite: 46]
3. [cite_start]Flexitank Logistics: Certified installation and transport of bulk non-hazardous liquids (edible oils, juices, industrial fluids) using FDA-approved tanks (12k-24k liters). [cite: 371]
4. [cite_start]Project Logistics: Handling heavy equipment, industrial cargo, and infrastructure project moves. [cite: 62]
5. [cite_start]Engineering Services: Inverter installation for quay cranes, equipment maintenance at terminals. [cite: 76]
6. [cite_start]Legal & Real Estate: Business incorporation consulting, warehouse leasing, trade permits. [cite: 57]

[BRITIUM EXPRESS]
- Overview: Premium, expedited logistics for urgent shipments.
- Key Features: Priority customs clearance, door-to-door rapid delivery, 24/7 dedicated support.

[PRODUCT SOURCING & TRADING]
- [cite_start]We source vetted products from Thailand, China, and Singapore. [cite: 424]
- [cite_start]We handle the entire chain: Sourcing -> Payment -> Logistics -> Delivery. [cite: 66]

[BRITIUM GALLERY (PRODUCTS)]
1. [cite_start]Executive Fashion: Premium handbags, laptop bags, travel pouches, crossbody bags. [cite: 91]
2. [cite_start]Tech Accessories: "MarsMyth" Triple Monitor Laptop Screen Extenders (14" FHD, 1080P). [cite: 84]
3. [cite_start]Corporate Gifts: Customized premium pens, smart notebooks, tumblers, and gift sets for branding. [cite: 94]

[INSTRUCTIONS FOR ANSWERING]
- If asked about prices: "Pricing depends on volume and specific requirements. Please contact our sales team at info@britiumventures.com for a quote."
- If asked about jobs: "We are hiring! Please check our Careers page or email your CV to job_application@britiumventures.com."
- Keep answers concise. Do not invent information not listed here.
`;

export default async function handler(req, res) {
  // A. Verify Request Method
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  // B. Verify API Key
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is missing in Vercel Environment Variables.");
    return res.status(500).json({ reply: "Server Configuration Error: API Key missing." });
  }

  try {
    const { message } = req.body;

    // C. Send Context + User Question to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Fast and cost-effective
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, // Inject the "Brain"
        { role: "user", content: message }          // The Customer's Question
      ],
      temperature: 0.7, // Creativity level (0.7 is balanced)
      max_tokens: 300,  // Limit response length
    });

    const aiReply = completion.choices[0].message.content;

    // D. Send Answer back to Website
    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ reply: "I am having trouble connecting to the server. Please try again in a moment." });
  }
}
