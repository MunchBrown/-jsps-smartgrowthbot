// AI-powered tools (Gemini). Every route here sits behind requireAuth + an
// active subscription, and is rate-limited per company in server.ts.
import { Router } from "express";
import { Type } from "@google/genai";
import { getGeminiClient, GEMINI_MODEL } from "../gemini";

const router = Router();

router.post("/seo", async (req, res) => {
  try {
    const { topic, keyword, platform } = req.body;
    if (!topic || !keyword) {
       res.status(400).json({ error: "Topic and keyword are required." });
       return;
    }

    const ai = getGeminiClient();
    const systemPrompt = "You are an expert Local SEO marketer specializing in the residential and commercial painting contractor industry. Your goal is to write search-optimized, engaging, and high-conversion content.";
    const userPrompt = `Write an optimized ${platform === "gpb" ? "Google Business Profile update (within 250 words, with call-to-action)" : "local SEO blog post (within 600 words, structured with headers, tips, and a compelling local CTA)"} for a painting company.
Topic: ${topic}
Target Local Keyword: ${keyword}
Make sure it sounds natural, local-friendly, authoritative, and focuses on high-quality prep work, beautiful finishes, and premium service.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("SEO Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate SEO content." });
  }
});

// 2. LeadFlow AI: Predictive Lead Scorer
router.post("/score-lead", async (req, res) => {
  try {
    const { budget, sqft, timeline, condition, clientType } = req.body;
    
    const ai = getGeminiClient();
    const prompt = `Evaluate the following lead for a painting contractor:
- Client Type: ${clientType || "Residential"}
- Estimated Project Budget: $${budget || "Unknown"}
- Surface Area (Sq Ft): ${sqft || "Unknown"}
- Project Timeline: ${timeline || "Flexible"}
- Existing Surface Condition: ${condition || "Average (some prep required)"}

Classify this lead as "Hot" (ready to buy, high value, low complexity or premium margin), "Warm" (moderate potential, standard job, needs typical follow-up), or "Cold" (low budget for high effort, far timeline, extremely poor surface conditions).
Return a JSON object containing:
1. "category": "Hot" | "Warm" | "Cold"
2. "score": a number from 0 to 100
3. "justification": 2-3 sentences explaining the rating based on margin, surface complexity, prep requirements, and timeline.
4. "actionPlan": list of 3 bulleted next-step follow-up activities.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            score: { type: Type.INTEGER },
            justification: { type: Type.STRING },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["category", "score", "justification", "actionPlan"]
        },
        temperature: 0.2,
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Lead Scorer Error:", error);
    res.status(500).json({ error: error.message || "Failed to score lead." });
  }
});

// 3. QuoteGenius AI: Proposal Upsell Generator
router.post("/upsells", async (req, res) => {
  try {
    const { projectType, targetBudget, selectedServices } = req.body;

    const ai = getGeminiClient();
    const prompt = `We are preparing a quotation proposal for a painting job:
- Project Type: ${projectType || "Residential Interior"}
- Target Budget: $${targetBudget || "3000"}
- Currently Selected Services: ${selectedServices || "Standard interior walls painting"}

Generate exactly 3 professional upsell opportunities that add high value to this client, such as ceiling painting, accent wall styling, trim/baseboard refinishing, deck staining, pressure washing, or wood repair.
Return a JSON array of objects. Each object should have:
1. "serviceName": name of the upsell service
2. "recommendedPrice": recommended standard upsell price (number, e.g., 450)
3. "benefit": a persuasive client-focused description (1-2 sentences) of why they should add this now (e.g., scaffolding is already set up, saves labor, complete look)
4. "difficulty": "Low" | "Medium" | "High"`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              serviceName: { type: Type.STRING },
              recommendedPrice: { type: Type.INTEGER },
              benefit: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["serviceName", "recommendedPrice", "benefit", "difficulty"]
          }
        },
        temperature: 0.6,
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Upsells Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate upsell opportunities." });
  }
});

// 4. ClientConnect AI: Smart AI Painting Chatbot
router.post("/chat", async (req, res) => {
  try {
    const { messages, message, history, systemInstruction } = req.body;
    
    let chatHistory: any[] = [];
    let sysInstruction = `You are the website assistant representing a high-end professional painting company.
Your goal is to qualify prospective clients, answer questions about prep work, colors, finishes, and scheduling, and guide them to book an estimate.
Keep answers concise, extremely polite, and helpful. Focus on:
- Explaining paint sheen options (matte vs eggshell vs satin vs semi-gloss)
- Reinforcing why meticulous preparation (washing, sanding, caulking) is 80% of a great paint job
- Offering to take down their project details to prompt a full proposal.`;

    if (history && Array.isArray(history)) {
      chatHistory = history.map((m: any) => ({
        role: m.role || (m.sender === "user" ? "user" : "model"),
        parts: m.parts || [{ text: m.text || m.content }]
      }));
      if (message) {
        chatHistory.push({
          role: "user",
          parts: [{ text: message }]
        });
      }
      if (systemInstruction) {
        sysInstruction = systemInstruction;
      }
    } else if (messages && Array.isArray(messages)) {
      chatHistory = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content || m.text }]
      }));
    } else if (message) {
      chatHistory = [{
        role: "user",
        parts: [{ text: message }]
      }];
    } else {
      res.status(400).json({ error: "Either messages array or history/message is required." });
      return;
    }

    const ai = getGeminiClient();
    // Keep only the latest 10 messages for context safety
    const recentHistory = chatHistory.slice(-10);

    // Extract the latest user message
    const latestMessage = recentHistory.pop();
    const contents = recentHistory.length > 0 ? [...recentHistory, latestMessage] : latestMessage?.parts?.[0]?.text || "Hello";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as any,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text, reply: response.text });
  } catch (error: any) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: error.message || "Chatbot service failed." });
  }
});

// 5. BusinessOS AI: Standard Operating Procedures (SOP) Generator
router.post("/sop", async (req, res) => {
  try {
    const { role, processName } = req.body;
    if (!role || !processName) {
      res.status(400).json({ error: "Role and processName are required." });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = "You are an operations scaling consultant specializing in franchising and systems-driven residential and commercial painting companies.";
    const userPrompt = `Create a complete, master-class Standard Operating Procedure (SOP) for:
Role: ${role}
Process: ${processName}

Include:
1. Purpose & Scope (Why it matters, who does it)
2. Materials & Tools required (if applicable)
3. Step-by-Step execution protocol (clear, action-oriented items)
4. Critical Quality Control check points (what to look for before moving to the next stage)
5. Safety Guidelines (hazards, PPE, ladder safety)`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({ sop: response.text });
  } catch (error: any) {
    console.error("SOP Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate SOP." });
  }
});

// 6. BusinessOS AI: AI Business Advisor
router.post("/advisor", async (req, res) => {
  try {
    const { activeLeads, avgJobValue, conversionRate, margin } = req.body;

    const ai = getGeminiClient();
    const prompt = `Analyze the following monthly business performance metrics for a painting contractor:
- Active Leads Generated/Month: ${activeLeads || 0}
- Average Estimate/Job Value: $${avgJobValue || 0}
- Estimate Win/Conversion Rate: ${conversionRate || 0}%
- Average Net Profit Margin: ${margin || 0}%

Calculate estimated Monthly Gross Revenue and Monthly Net Profit based on these numbers (Revenue = Active Leads * (Win Rate/100) * Avg Job Value; Profit = Revenue * (Margin/100)).
Provide a professional, actionable Business Health Assessment and Strategic Growth Roadmap.
Return a JSON object containing:
1. "estimatedRevenue": number (rounded)
2. "estimatedProfit": number (rounded)
3. "healthStatus": "Needs Attention" | "Stable Growth" | "Highly Optimized"
4. "observations": list of 3 bulleted analysis comments highlighting strengths and bottlenecks
5. "recommendations": list of 3 specific, actionable recommendations (e.g., raise prices, invest in lead follow-up automation, optimize labor crew routing)`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedRevenue: { type: Type.INTEGER },
            estimatedProfit: { type: Type.INTEGER },
            healthStatus: { type: Type.STRING },
            observations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["estimatedRevenue", "estimatedProfit", "healthStatus", "observations", "recommendations"]
        },
        temperature: 0.3,
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    res.status(500).json({ error: error.message || "Failed to run advisor analysis." });
  }
});

// 7. AI Phone System: Conversational Receptionist Turn
router.post("/phone/receptionist", async (req, res) => {
  try {
    const { messages, script, callType, contactName, companyName } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const ai = getGeminiClient();
    const chatHistory = messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const systemInstruction = `You are the AI receptionist representing ${companyName || "the painting company"}.
The current call type is ${callType || "inbound"}. You are speaking with ${contactName || "the caller"}.
Your primary instruction and style guidelines:
${script || "Greet the caller warmly, ask how you can help, explain paint finish options, and offer to book a premium painting estimate."}

CRITICAL RULES FOR PHONE CONVERSATION:
- Answer in 1-2 short, conversational, and voice-friendly sentences (maximum 30 words per response).
- NEVER use markdown, bullet points, asterisks, or formatting. Write raw, clean spoken text only.
- Speak warmly and professionally, as if you are talking in real-time over the phone.
- If they want to book an estimate or share details, guide them to schedule a free onsite paint survey.`;

    const latestMessage = chatHistory.pop();
    const contents = chatHistory.length > 0 ? [...chatHistory, latestMessage] as any : latestMessage?.parts?.[0]?.text || "Hello";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Phone Receptionist Error:", error);
    res.status(500).json({ error: error.message || "Phone system conversation turn failed." });
  }
});

// 8. AI Phone System: Optimize Script
router.post("/phone/optimize-script", async (req, res) => {
  try {
    const { script, tone, companyName } = req.body;
    if (!script) {
      res.status(400).json({ error: "Script text is required." });
      return;
    }

    const ai = getGeminiClient();
    const systemInstruction = "You are an expert telemarketing and phone script consultant for high-end home services and painting contractors.";
    const userPrompt = `Refine and optimize this telephone voice script/greeting to sound highly conversational, engaging, and professional.
Company: ${companyName || "the painting company"}
Desired Tone: ${tone || "Professional & Friendly"}
Current Script draft:
"${script}"

Provide an optimized, high-converting script of about 2-4 sentences that is clean, clear, and perfectly suited for an AI Voice Agent to read. Keep it natural and punchy.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ optimizedScript: response.text?.trim() });
  } catch (error: any) {
    console.error("Optimize Script Error:", error);
    res.status(500).json({ error: error.message || "Failed to optimize phone script." });
  }
});

// 9. AI Phone System: Generate Call Summary
router.post("/phone/generate-summary", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || !Array.isArray(transcript)) {
      res.status(400).json({ error: "Transcript is required." });
      return;
    }

    const ai = getGeminiClient();
    const transcriptText = transcript.map(t => `${t.sender}: ${t.text}`).join("\n");

    const prompt = `Review this conversation transcript between our AI receptionist/outbound caller and a prospect:
"""
${transcriptText}
"""

Please analyze and summarize the call.
Return a JSON object containing:
1. "summary": a single, concise paragraph (maximum 3 sentences) summarizing the client's request, emotional tone, and key paint project criteria (rooms, schedule, budget).
2. "leadQualified": boolean (true if they are genuinely interested in painting services and showed intent to get a quote, book a survey, or follow up, false if it's spam, wrong number, or negative refusal).
3. "actionItems": list of exactly 2-3 actionable next steps (e.g., "Create premium estimate", "Assign Sarah for call-back", "Book exterior trim survey for Wednesday").`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            leadQualified: { type: Type.BOOLEAN },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "leadQualified", "actionItems"]
        },
        temperature: 0.2,
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Generate Call Summary Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate call analysis." });
  }
});

// BusinessOS AI: Text Strategic Advisor
router.post("/strategic-advisor", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: "Question is required." });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = "You are an operations scaling consultant and strategic advisor specializing in franchising, pricing psychology, and high-margin growth for residential and commercial painting companies.";
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Answer this strategic business question: "${question}". Provide a professional, detailed response structured with bullet points and clear, actionable business strategies specifically for a painting contractor in a competitive local market.`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    res.json({ guidance: response.text });
  } catch (error: any) {
    console.error("Strategic Advisor Error:", error);
    res.status(500).json({ error: error.message || "Failed to consult strategic advisor." });
  }
});

// BusinessOS AI: Generate SOP by Topic
router.post("/generate-sop", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ error: "SOP topic is required." });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = "You are an operations scaling consultant specializing in drafting master-class Standard Operating Procedures (SOPs) for systems-driven painting contractors.";
    const userPrompt = `Create a complete Standard Operating Procedure (SOP) for the topic: "${topic}".
Include:
1. Purpose & Scope (Why it matters, who does it)
2. Materials & Tools required (if applicable)
3. Step-by-Step execution protocol (clear, action-oriented items)
4. Critical Quality Control check points (what to look for before moving to the next stage)
5. Safety Guidelines (hazards, PPE, ladder safety)`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({ sop: response.text });
  } catch (error: any) {
    console.error("SOP Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate SOP." });
  }
});

// QuoteGenius AI: Room Photo Estimate Analyzer
router.post("/room-photo-estimate", async (req, res) => {
  // Real vision analysis of the uploaded photo. If the photo can't be read we
  // say so instead of inventing measurements.
  const { imageData, imageType } = req.body || {};
  const mime = String(imageType || "");
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(mime) || typeof imageData !== "string" || imageData.length < 100) {
    res.status(400).json({ error: "Upload a JPG, PNG, WEBP or HEIC photo of the room." });
    return;
  }
  if (imageData.length > 7_000_000) {
    res.status(413).json({ error: "That photo is too large. Use one under 5 MB." });
    return;
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: mime, data: imageData.replace(/^data:[^,]+,/, "") } },
          { text: `You are helping a painting estimator. From this room photo, estimate the wall height, the room width and length in feet, how many doors and windows are visible, and the best paint sheen for this room type. Use visual cues (doors are about 6'8" tall, outlets about 16" up). If something is not visible, give your best typical estimate and lower the confidence. Answer in JSON.` },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wallHeight: { type: Type.INTEGER },
            wallWidth: { type: Type.INTEGER },
            wallLength: { type: Type.INTEGER },
            doors: { type: Type.INTEGER },
            windows: { type: Type.INTEGER },
            suggestedSheen: { type: Type.STRING },
            confidence: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          required: ["wallHeight", "wallWidth", "wallLength", "doors", "windows", "suggestedSheen", "confidence"],
        },
        temperature: 0.2,
      },
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Room Photo Estimate Error:", error);
    res.status(502).json({ error: "The photo couldn't be analyzed right now. Enter the measurements by hand." });
  }
});

// Universal LLM Proxy Endpoint

const seededOpportunities = [
  {
    solicitationNumber: "VA245-24-B-0089",
    title: "Exterior Painting and Wood Trim Repair - VA Medical Center Building 10",
    agency: "Department of Veterans Affairs (VA)",
    office: "Network Contracting Office 5 (NCO 5)",
    postedDate: "2026-07-01",
    responseDeadline: "2026-08-15",
    setAsideType: "Service-Disabled Veteran-Owned Small Business (SDVOSB)",
    estimatedValue: 320000,
    placeOfPerformance: "Martinsburg, WV",
    description: "Scrape, prime, and paint all exterior siding, soffits, fascia, and windows on Building 10. Perform wet glaze window putty replacement and lead-paint encapsulation. Must match historical paint schemes under SSPC standards.",
    poc: "contracting.officer.martinsburg@va.gov",
    link: "https://sam.gov/opp/VA245-24-B-0089/view"
  },
  {
    solicitationNumber: "FA489026Q0104",
    title: "Hangar 4 Interior Coating and Corrosion Control",
    agency: "Department of the Air Force (USAF)",
    office: "ACC Air Combat Command (Langley AFB)",
    postedDate: "2026-07-03",
    responseDeadline: "2026-07-28",
    setAsideType: "Total Small Business Set-Aside",
    estimatedValue: 180000,
    placeOfPerformance: "Langley AFB, VA",
    description: "Provide surface preparation SSPC-SP10 (Near-White Blast Cleaning) and application of high-performance epoxy and urethane coatings to structural steel members and interior wall assemblies of Hangar 4. Requires safety scaffolding and OSHA fall protection.",
    poc: "langley.contracting@us.af.mil",
    link: "https://sam.gov/opp/FA489026Q0104/view"
  },
  {
    solicitationNumber: "NPS-YELL-PAINT-2026",
    title: "Historic Cabin Refurbishment and Lead Abatement",
    agency: "Department of the Interior (DOI) / National Park Service (NPS)",
    office: "Yellowstone National Park Contracting Office",
    postedDate: "2026-06-25",
    responseDeadline: "2026-07-20",
    setAsideType: "HUBZone",
    estimatedValue: 85000,
    placeOfPerformance: "Mammoth Hot Springs, WY",
    description: "High-precision exterior painting and scraping of 12 historic ranger cabins. Highly sensitive natural area requiring strict EPA Lead-Safe Certified Practices and low-VOC paints.",
    poc: "yell_contracting@nps.gov",
    link: "https://sam.gov/opp/NPS-YELL-PAINT-2026/view"
  },
  {
    solicitationNumber: "GSA-PB-PAINT-883",
    title: "Federal Building Parking Deck Line Striping & Structural Steel Sealant",
    agency: "General Services Administration (GSA)",
    office: "Public Buildings Service Region 4",
    postedDate: "2026-07-06",
    responseDeadline: "2026-09-01",
    setAsideType: "Women-Owned Small Business (WOSB)",
    estimatedValue: 420000,
    placeOfPerformance: "Atlanta, GA",
    description: "Power-washing, industrial surface preparation, structural steel painting with premium anti-corrosive primer, and lane striping of multi-level federal parking deck (500 stalls).",
    poc: "atlanta.gsa.contracts@gsa.gov",
    link: "https://sam.gov/opp/GSA-PB-PAINT-883/view"
  },
  {
    solicitationNumber: "DOT-FHWA-2026-12",
    title: "Highway 101 Bridge Protective Coating Project",
    agency: "Department of Transportation (DOT) / Federal Highway Administration (FHWA)",
    office: "Western Federal Lands Highway Division",
    postedDate: "2026-07-07",
    responseDeadline: "2026-07-15",
    setAsideType: "Unrestricted",
    estimatedValue: 1200000,
    placeOfPerformance: "Lincoln County, OR",
    description: "Full abrasive blasting (SSPC-SP6) and multi-coat high-durability acrylic polymer coating of steel and concrete bridge elements over tidal waters. Strict environmental containment and EPA monitoring required.",
    poc: "westernlands@dot.gov",
    link: "https://sam.gov/opp/DOT-FHWA-2026-12/view"
  },
  {
    solicitationNumber: "HUD-HOUSING-7731",
    title: "Public Housing Multi-Family Interior Repaint",
    agency: "Department of Housing and Urban Development (HUD)",
    office: "Region 9 Contracting Office",
    postedDate: "2026-07-05",
    responseDeadline: "2026-07-10",
    setAsideType: "8(a) Program Only",
    estimatedValue: 65000,
    placeOfPerformance: "Phoenix, AZ",
    description: "Drywall repairs, caulking, prime-and-paint of interior walls, doors, trim, and ceilings for 45 units. Fast turnaround required (2 units per day). Prevailing wages apply (Davis-Bacon Act).",
    poc: "phx.hud.contracts@hud.gov",
    link: "https://sam.gov/opp/HUD-HOUSING-7731/view"
  }
];

// Endpoint to fetch active government opportunities
router.get("/gov/opportunities", async (req, res) => {
  const apiKey = process.env.SAM_API_KEY;
  if (apiKey) {
    try {
      console.log("[GovContracting] SAM_API_KEY detected, fetching active painting opportunities...");
      // SAM.gov requires a posted-date window (MM/dd/yyyy, max 1 year).
      const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
      const to = new Date();
      const from = new Date(Date.now() - 90 * 24 * 3600 * 1000);
      const url = `https://api.sam.gov/opportunities/v2/search?api_key=${encodeURIComponent(apiKey)}&ncode=238320&limit=25&postedFrom=${fmt(from)}&postedTo=${fmt(to)}`;
      const apiRes = await fetch(url);
      
      if (apiRes.ok) {
        const data: any = await apiRes.json();
        const translated = (data.opportunities || []).map((opp: any) => {
          const oppData = opp.opportunityData || {};
          return {
            solicitationNumber: oppData.solicitationNumber || oppData.solicitationNo || opp.solicitationNumber || "N/A",
            title: oppData.title || opp.title || "N/A",
            agency: oppData.parentDepartmentName || (opp.department ? opp.department.name : "N/A"),
            office: oppData.officeName || "N/A",
            postedDate: oppData.postedDate || opp.postedDate || "N/A",
            responseDeadline: oppData.responseDate || opp.responseDate || "N/A",
            setAsideType: oppData.setAside || opp.setAside || "Unrestricted",
            estimatedValue: oppData.value || 150000,
            placeOfPerformance: oppData.placeOfPerformance?.state?.name || oppData.placeOfPerformance?.city?.name || "N/A",
            description: oppData.description || opp.description || "N/A",
            poc: oppData.pointOfContact?.[0]?.email || oppData.pointOfContact?.[0]?.fullName || "N/A",
            link: opp.uiLink || oppData.uiLink || `https://sam.gov/opp/${opp.noticeId || opp.solicitationNumber}/view`
          };
        });
        res.json({ live: true, opportunities: translated });
        return;
      } else {
        console.warn("[GovContracting] SAM.gov API error, falling back to cached list:", apiRes.status);
      }
    } catch (err) {
      console.error("[GovContracting] Error fetching live SAM.gov opportunities:", err);
    }
  }

  // Fallback to pre-seeded list representing high-quality opportunities
  res.json({ live: false, opportunities: seededOpportunities });
});

// Endpoint to draft a five-volume FAR-compliant proposal structure using Gemini API
router.post("/gov/generate-proposal", async (req, res) => {
  try {
    const { solicitation, companyProfile } = req.body;
    if (!solicitation) {
      res.status(400).json({ error: "Solicitation details are required." });
      return;
    }

    const ai = getGeminiClient();

    const companyName = companyProfile?.name || "[Your company name]";
    const uei = companyProfile?.uei || "N/A";
    const cageCode = companyProfile?.cage || "N/A";
    const certifications = companyProfile?.certifications || [];
    const bondingSingle = companyProfile?.bondingSingle || "N/A";
    const bondingAggregate = companyProfile?.bondingAggregate || "N/A";

    const prompt = `You are a professional FAR-compliant federal government procurement consultant specializing in NAICS 238320 (Painting and Wall Covering Contractors).
Your task is to draft a comprehensive, five-volume proposal response for a painting contractor.

Oppportunity Solicitation Details:
- Solicitation Number: ${solicitation.solicitationNumber}
- Project Title: ${solicitation.title}
- Agency Name: ${solicitation.agency}
- Place of Performance: ${solicitation.placeOfPerformance}
- Scope / Description: ${solicitation.description}
- Set-Aside: ${solicitation.setAsideType}
- Estimated Project Value: $${solicitation.estimatedValue}

Contractor Stored Company Profile:
- Company Name: ${companyName}
- Unique Entity ID (UEI): ${uei}
- CAGE Code: ${cageCode}
- Certifications / Set-Aside Eligible: ${certifications.join(", ") || "None specified"}
- Single Project Bonding: ${bondingSingle}
- Aggregate Bonding Capacity: ${bondingAggregate}

CRITICAL RULES:
1. NEVER fabricate or invent missing company profile or contract details (e.g. CAGE codes, past performance contacts, exact employee counts, or financial records). If any information is not provided above, you MUST write clearly visible, standard bracketed placeholders (e.g. "[INSERT CAGE CODE]", "[INSERT POC EMAIL]", "[INSERT PAST CONTRACT VALUE]").
2. NO AUTO-SUBMISSION EVER. Underline that the platform only generates proposals for human review and edit.
3. Every generated draft MUST contain a prominent disclaimer that it must be reviewed by a human familiar with FAR compliance before submission.
4. Integrate the federal requirements such as SSPC standards (e.g., SSPC-SP1, SP-2, SP-6, SP-10 depending on context) and Davis-Bacon prevailing wages in the narrative where appropriate.

Structure the draft proposal into the following 5 JSON fields:
- "volume1": Volume I — Cover Letter & Executive Summary. Address to the Agency contracting officer, highlighting the contractor's fit, UEI, CAGE, certifications, and high-level commitment.
- "volume2": Volume II — Technical Approach. Outline a robust prep and coating methodology tailored to the solicitation. Detail SSPC standards, lead-safe practices if applicable, environmental containment, quality control, and an OSHA/EPA safety narrative.
- "volume3": Volume III — Past Performance. Create 2 structured placeholders for past performance references formatted like a CPARS report (Contract No, Agency, Title, Performance Rating, Description, Bracketed placeholders for contact numbers/emails).
- "volume4": Volume IV — Pricing & Davis-Bacon. Present a structured cost breakdown draft (Labor, Materials, Bonding & Insurance, Environmental Containment, Overhead & Margin). Include narrative reinforcing that wages meet or exceed the Davis-Bacon Act prevailing wage requirements for painters and laborers in ${solicitation.placeOfPerformance}.
- "volume5": Volume V — Administrative. Draft representations, certifications, and compliance declarations. Reference standard FAR clauses like 52.212-1 through 52.212-5.

Return a JSON object containing the fields: "volume1", "volume2", "volume3", "volume4", "volume5", and "disclaimer".`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            volume1: { type: Type.STRING, description: "Volume I markdown draft" },
            volume2: { type: Type.STRING, description: "Volume II markdown draft" },
            volume3: { type: Type.STRING, description: "Volume III markdown draft" },
            volume4: { type: Type.STRING, description: "Volume IV markdown draft" },
            volume5: { type: Type.STRING, description: "Volume V markdown draft" },
            disclaimer: { type: Type.STRING, description: "Regulatory review disclaimer" }
          },
          required: ["volume1", "volume2", "volume3", "volume4", "volume5", "disclaimer"]
        },
        temperature: 0.3
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Proposal Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate proposal draft." });
  }
});

// General-purpose completion used by the funnel builder and other AI tools.
// Always uses this server's own Gemini key — client-supplied keys and URLs are ignored.
async function complete(req: any, res: any) {
  const b = req.body || {};
  const fromMessages = Array.isArray(b.messages)
    ? b.messages.map((m: any) => `${m.role === "assistant" ? "Assistant" : "User"}: ${String(m.content ?? "")}`).join("\n\n")
    : "";
  const prompt = String(b.prompt || fromMessages || "").slice(0, 20000);
  if (!prompt) {
    res.status(400).json({ success: false, error: "A prompt is required." });
    return;
  }
  const started = Date.now();
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: String(b.systemPrompt || "You are an expert advisor for painting contractors.").slice(0, 5000),
        temperature: Math.min(1.5, Math.max(0, Number(b.temperature ?? 0.7))),
        maxOutputTokens: Math.min(4096, Math.max(64, Number(b.maxTokens || 2048))),
      },
    });
    res.json({ success: true, text: response.text || "", latencyMs: Date.now() - started });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "AI request failed." });
  }
}
router.post("/ai/complete", complete);
router.post("/llm-proxy", complete);

export default router;
