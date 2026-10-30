// routes/ai.js
const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../services/aiService");

// GET /ai-guide - Dedicated AI Pilgrimage Assistant Page
router.get("/ai-guide", (req, res) => {
    res.render("ai-guide", {
        title: "Divya Yatra AI - Spiritual Travel Guide",
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

module.exports = router;
