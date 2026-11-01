// routes/ai.js
const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../services/aiService");

// GET /ai-guide - Dedicated AI Pilgrimage Assistant Page
router.get("/ai-guide", (req, res) => {
    const initialPrompt = req.query.prompt || (req.query.destination ? `Create a complete spiritual travel itinerary and darshan guide for ${req.query.destination}` : "");
    const initialDestination = req.query.destination || "";

    res.render("ai-guide", {
        title: "Divya Yatra AI - World-Class Spiritual Travel Guide",
        initialPrompt: initialPrompt,
        initialDestination: initialDestination,
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("<")),
        hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("<"))
    });
});

// POST /api/ai-chat - Handles chat queries for both page & floating widget
router.post("/api/ai-chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please provide a valid question or message."
            });
        }

        const reply = await getAIResponse(message.trim(), history || []);
        res.json({
            success: true,
            reply: reply,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("AI Chat Route Error:", err);
        res.status(500).json({
            error: "An error occurred while generating your spiritual guide. Please try again.",
            details: err.message
        });
    }
});

// POST /api/ai-itinerary - Structured Itinerary Generator Wizard
router.post("/api/ai-itinerary", async (req, res) => {
    try {
        const { destination, days = 3, travelers = 2, budgetType = "Standard", pace = "Peaceful", specialNeeds = "None" } = req.body;
        
        if (!destination || typeof destination !== "string" || !destination.trim()) {
            return res.status(400).json({ error: "Destination is required." });
        }

        const customPrompt = `Generate an exact, detailed, hour-by-hour sacred spiritual pilgrimage itinerary for:
- Destination: ${destination.trim()}
- Duration: ${days} Day(s)
- Travelers: ${travelers} devotee(s)
- Budget Style: ${budgetType} (Ashram / Dharamshala / Hotel)
- Travel Pace: ${pace}
- Special Considerations: ${specialNeeds}

Please include:
1. Complete day-wise schedule with morning Mangala/Brahma Muhurta darshan, afternoon rest, and evening Maha Aarti.
2. Official darshan booking advice, dress code rules, and token requirements.
3. Nearest transit (Railway Station and Airport with distance).
4. Recommended pure Sattvic bhojan, free Langar/Annadanam spots, and peaceful Dharamshala/Ashram stays.
5. Specific tips for ${specialNeeds === "Senior Citizens" ? "senior citizens and wheelchair assistance" : "all travelers"}.`;

        const reply = await getAIResponse(customPrompt, []);
        res.json({
            success: true,
            destination: destination.trim(),
            days: days,
            itinerary: reply,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("AI Itinerary Route Error:", err);
        res.status(500).json({
            error: "Failed to create itinerary. Please try again.",
            details: err.message
        });
    }
});

module.exports = router;
