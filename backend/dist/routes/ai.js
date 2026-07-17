"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
    genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
}
// Simulated rule-based AI fallback for offline/no-key usage
const getSimulatedResponse = (message) => {
    const query = message.toLowerCase();
    if (query.includes('can i donate') || query.includes('eligibility') || query.includes('eligible')) {
        return `To donate blood, you must meet these key criteria:
1. **Age:** Between 18 and 65 years.
2. **Weight:** At least 45 kg (some centers require 50 kg).
3. **Interval:** At least 90 days (3 months) since your last donation.
4. **General Health:** You should feel healthy, not have a fever, active infections, or be taking antibiotics.
5. **No Recent Deferrals:** No recent tattoos, major surgeries, or piercings in the last 6 months.

You can use the **Eligibility Checker** tool in your dashboard for a quick, interactive assessment!`;
    }
    if (query.includes('how often') || query.includes('when can i donate again') || query.includes('interval') || query.includes('how many days')) {
        return `In India, the standard interval between blood donations is:
- **For Men:** Every 90 days (3 months).
- **For Women:** Every 120 days (4 months).

This interval allows your body's iron stores and red blood cells to fully replenish before donating again.`;
    }
    if (query.includes('safe') || query.includes('risk') || query.includes('contract') || query.includes('disease')) {
        return `Yes, donating blood is completely safe!
- A brand-new, sterile needle is opened in front of you for each donation and disposed of immediately afterward.
- It is physically impossible to contract any blood-borne disease (like HIV or Hepatitis) by donating blood.
- The donation process takes about 8-10 minutes, and the volume donated (about 350ml-450ml) is easily replaced by your body within 24-48 hours.`;
    }
    if (query.includes('myth') || query.includes('fact') || query.includes('pain') || query.includes('weak')) {
        return `Here are common myths and facts about blood donation:
- **Myth:** Donating blood makes you weak.
  *Fact:* Your body replenishes blood volume within 48 hours. Eating a good meal and drinking fluids resolves any temporary fatigue.
- **Myth:** It takes a long time to recover.
  *Fact:* You can resume normal daily activities after a short 10-15 minute rest post-donation. Avoid heavy lifting for the rest of the day.
- **Myth:** The needle hurts a lot.
  *Fact:* You'll feel a brief pinch for 2 seconds. The rest of the process is virtually painless!`;
    }
    if (query.includes('prep') || query.includes('eat') || query.includes('before') || query.includes('after') || query.includes('tips')) {
        return `Here are preparation tips for a successful donation:
**Before Donating:**
- Sleep well (at least 6-8 hours) the night before.
- Drink plenty of water and fluids (stay hydrated!).
- Have a healthy, low-fat meal 3 hours before donating. Do not donate on an empty stomach.
- Avoid alcohol for 24 hours before donating.

**During Donating:**
- Wear clothes with sleeves that can be easily rolled up.
- Relax and take deep breaths.

**After Donating:**
- Rest for 10-15 minutes at the refreshment area.
- Drink fluids and eat the snacks provided.
- Keep the bandage on for a few hours.
- Avoid strenuous physical exercise or lifting heavy weights for the rest of the day.`;
    }
    return `Hello! I am your RudhiraConnect Blood Buddy AI Assistant. 

You can ask me questions like:
- "Can I donate blood?"
- "Is blood donation safe?"
- "What are the preparation tips before donating?"
- "How often can I donate blood?"
- "Tell me about blood donation myths."

How can I help you today?`;
};
// POST chat with AI Assistant
router.post('/chat', auth_1.authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message content is required.' });
        }
        if (!genAI) {
            // Fall back to rule-based offline simulator
            const simulatedText = getSimulatedResponse(message);
            return res.json({ response: simulatedText, source: 'simulated-offline' });
        }
        // Call Gemini API
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `You are the RudhiraConnect AI Assistant, an empathetic, professional, and knowledgeable health assistant specialized in voluntary blood donation. 
Your goal is to educate users, alleviate their fears, bust common myths, explain guidelines (before, during, and after donating), and answer FAQs.
Keep your answers brief, encouraging, formatted in readable bullet points, and centered on voluntary blood donation.
If a user asks about complex medical diagnoses, urge them to consult a qualified physician. Always remind users to stay hydrated.`,
        });
        const result = await model.generateContent(message);
        const responseText = result.response.text();
        res.json({ response: responseText, source: 'gemini-api' });
    }
    catch (error) {
        console.error('Gemini API error, falling back to simulator:', error);
        // Graceful fallback to simulator on API error
        const simulatedText = getSimulatedResponse(req.body.message || '');
        res.json({ response: simulatedText, source: 'simulated-fallback-error' });
    }
});
exports.default = router;
