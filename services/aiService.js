// services/aiService.js
// Handles AI pilgrimage inquiries using Google Gemini API, OpenAI, or a rich Built-in Spiritual Knowledge Engine.

const sampleData = (() => {
    try {
        return require("../init/data.js").data || [];
    } catch (e) {
        return [];
    }
})();

const SYSTEM_PROMPT = `
You are 'Divya Yatra AI' (दिव्य यात्रा AI), the ultimate, reverent, and wise spiritual guide for the India Pilgrimage Guide platform.
You assist devotees and travelers seeking peace, blessing, and spiritual discovery across India's sacred destinations (Hindu, Sikh, Buddhist, Jain, Sufi/Muslim, Christian, and all spiritual paths).

Your expertise includes:
1. Detailed Day-by-Day Spiritual Itineraries (morning darshan, afternoon rest/visit, evening aartis).
2. Darshan rules, dress codes, Aarti timings, VIP/Special passes, and official shrine board procedures.
3. Transportation (nearest railway stations, airports, ghat boat rides, ropeways, yatra trekking routes).
4. Accommodation advice (Temple trust guesthouses, peaceful Ashrams, Dharamshalas, budget to luxury hotels).
5. Holy Prasad, Sattvic bhojan, free Langar/Annadanam, and fasting recommendations.
6. Sacred history, cultural reverence, and significance in simple, heartfelt language.
7. Special care tips for elderly pilgrims, children, wheelchair accessibility, and weather safety.

Tone & Formatting:
- Warm, polite, spiritually uplifting, and highly practical.
- Use clear headings, markdown bullet points, bold key highlights, and helpful emojis.
- Keep recommendations realistic and actionable.
`;

// Helper: Call Google Gemini REST API
async function callGemini(apiKey, prompt, history = []) {
    // Format conversation history for Gemini
    const contents = [];

    // Add prior turns if available
    if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(item => {
            const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
            contents.push({
                role: role,
                parts: [{ text: String(item.content || item.text || "") }]
            });
        });
    }

    contents.push({
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${prompt}` }]
    });

    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1200
                    }
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Gemini API ${res.status}: ${errText}`);
            }

            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
                return reply.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`Gemini (${model}) failed:`, err.message);
        }
    }

    throw lastError || new Error("Failed to get response from Gemini");
}

// Helper: Call OpenAI REST API
async function callOpenAI(apiKey, prompt, history = []) {
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];

    if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(item => {
            const role = item.role === "assistant" || item.role === "model" ? "assistant" : "user";
            messages.push({ role, content: String(item.content || item.text || "") });
        });
    }

    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1200
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (reply) {
        return reply.trim();
    }
    throw new Error("Empty response from OpenAI");
}

// Built-in Spiritual Knowledge Engine (Zero-setup Fallback)
function getBuiltInResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. Itinerary Planning queries
    if (q.includes("itinerary") || q.includes("plan") || q.includes("day") || q.includes("trip")) {
        if (q.includes("varanasi") || q.includes("kashi") || q.includes("banaras")) {
            return `### 🕉️ 3-Day Sacred Varanasi (Kashi) Itinerary

**Day 1: Arrival & The Divine Ganga Aarti**
- **Morning**: Check-in at Godowlia or Assi Ghat ashram. Rest and refresh.
- **Afternoon**: Stroll through the ancient lanes of Vishwanath Gali and savor hot *Kachori-Jalebi* and *Banarasi Paan*.
- **Evening (5:30 PM)**: Take a sunset boat ride along Dashashwamedh Ghat to witness the mesmerizing **Maha Ganga Aarti**.

**Day 2: Kashi Vishwanath & Sarnath Excursion**
- **Dawn (5:00 AM)**: Attend *Mangala Aarti* or general darshan at **Shri Kashi Vishwanath Corridor** (dress code: traditional/modest).
- **Morning**: Visit **Kaal Bhairav Temple** (the Kotwal of Kashi) and Sankat Mochan Hanuman Temple.
- **Afternoon**: Drive 10 km to **Sarnath** where Lord Buddha delivered his first sermon. Explore Dhamek Stupa & Sarnath Museum.
- **Night**: Peaceful stroll at Assi Ghat enjoying the gentle Ganga breeze.

**Day 3: Sacred Snan & Return**
- **Sunrise**: Holy snan (bath) at Manikarnika / Dashashwamedh Ghat.
- **Midday**: Shop for authentic Banarasi Silk Sarees from local weaver cooperatives.
- **Depart**: Head to Varanasi Cantt / Banaras Railway Station (BSBS) or Lal Bahadur Shastri Airport.

💡 *Pilgrim Tip: Pre-book Sugam Darshan tickets online via the Shri Kashi Vishwanath Shrine Board portal to save 2-3 hours.*`;
        }

        if (q.includes("kedarnath") || q.includes("char dham") || q.includes("badrinath") || q.includes("uttarakhand")) {
            return `### 🏔️ Sacred Kedarnath & Badrinath (Do Dham) Spiritual Plan

**Best Time to Visit**: May to June & September to October (avoid peak monsoons in July-August).

**Day-by-Day Overview**:
- **Day 1: Haridwar/Rishikesh to Guptkashi/Sonprayag**
  - Scenic 7-8 hour drive along Mandakini river. Night stay in Sonprayag or Guptkashi.
- **Day 2: The Holy Kedarnath Trek (16-18 km)**
  - Start at 5:00 AM from Gaurikund (ponies, palanquins, or helicopter from Phata/Sersi available).
  - Reach Kedarnath Dham by afternoon. Attend evening divine Aarti amidst snow-capped peaks. Overnight stay in GMVN camp/dharamshala.
- **Day 3: Morning Darshan & Descent to Guptkashi**
  - Early morning darshan inside the Sanctum Sanctorum. Trek back to Gaurikund, drive to Guptkashi.
- **Day 4: Guptkashi to Badrinath Dham (190 km)**
  - Drive via Chopta and Joshimath. Reach Badrinath, take holy dip in Tapt Kund (hot sulfur spring).
  - Evening Maha Aarti of Lord Badri Vishal.
- **Day 5: Mana Village & Return to Rishikesh**
  - Visit **Mana** (the first Indian village, Vyas Gufa, and Saraswati river origin), then begin return journey.

⚠️ *Essential Checklist: Biometric Yatra Registration is mandatory on registrationandtouristcare.uk.gov.in. Carry thermal layers, rain poncho, and a basic medical kit.*`;
        }

        if (q.includes("tirupati") || q.includes("balaji") || q.includes("andhra") || q.includes("south")) {
            return `### 🛕 2-Day Tirupati Balaji (Sri Venkateswara) Pilgrimage Plan

**Day 1: Arrival & Alipiri Footpath or Drive to Tirumala**
- **Morning**: Arrive at Tirupati Railway Station (TPTY) or Renigunta Airport. Check in at Srinivasam or Vishnu Nivasam guesthouses.
- **Option A (Trek)**: Walk up via Alipiri Mettu (9 km, ~3,550 steps, 4-5 hours) or Srivari Mettu (2.5 km, 2 hours).
- **Option B (Road)**: Take an electric APSRTC bus or cab up the Seven Hills to Tirumala.
- **Afternoon**: Report for Tonsuring (Kalyanakatta) and sacred Pushkarini lake bath.
- **Evening**: Visit Sri Bedi Anjaneya Swamy Temple and partake in Annaprasadam.

**Day 2: Maha Darshan & Lower Tirupati Temples**
- **Early Morning**: Enter queue with your Special Entry Darshan (₹300) slot or Sarva Darshan token.
- **Afternoon**: Collect the sacred **Tirupati Laddoo Prasadam**. Descend to Tirupati town.
- **Evening**: Visit **Sri Padmavathi Ammavari Temple** in Tiruchanur and **Sri Govindaraja Swamy Temple** before departure.

⚠️ *Strict Dress Code: Men must wear Dhoti/Kurta or Pyjama-Kurta (no jeans/shorts). Women must wear Saree or Salwar Kameez with Dupatta.*`;
        }

        // Generic Itinerary generator
        return `### 🗺️ Custom Spiritual Itinerary Blueprint

Here is an ideal spiritual journey framework for any sacred destination in India:

- **Phase 1: Arrival & Grounding (Day 1)**
  - Arrive early, settle in an ashram or temple guest house.
  - Familiarize with temple premises, darshan rules, and timings.
  - Attend evening sunset Aarti and musical prayers.

- **Phase 2: Main Sanctum Darshan & Rituals (Day 2)**
  - Early morning *Brahmamuhurta* bath and peaceful darshan before crowds peak.
  - Partake in holy *Prasadam* or community *Annadanam/Langar*.
  - Visit secondary shrines, sacred ponds (Kunds/Pushkarinis), and historical heritage spots.

- **Phase 3: Seva, Reflection & Departure (Day 3)**
  - Participate in morning volunteer service (*Karseva/Seva*).
  - Explore local spiritual markets for idols, sacred books, rudraksha, and local crafts.

Tell me your specific destination (e.g. *Varanasi, Tirupati, Golden Temple, Shirdi, Kedarnath, Ayodhya*), number of days, and travelers, and I will customize every hour for you!`;
    }

    // 2. Dress Code and Rules Queries
    if (q.includes("dress") || q.includes("clothes") || q.includes("rules") || q.includes("code") || q.includes("guideline")) {
        return `### 👔 Temple & Holy Shrine Dress Codes in India

Each tradition upholds sacred modesty:

- **South Indian Temples (Tirupati, Madurai, Guruvayur, Rameswaram)**:
  - **Men**: Traditional Dhoti/Mundu or Kurta-Pyjama. In temples like Guruvayur and Padmanabhaswamy, men must remove shirts before entering the sanctum.
  - **Women**: Saree, Half-Saree, or Salwar Kameez with Dupatta. Western clothes (jeans, tights, sleeveless tops) are strictly prohibited.

- **Sikh Gurdwaras (Golden Temple, Bangla Sahib, Anandpur Sahib)**:
  - Both men and women **must cover their heads** (scarves/rumals provided at entry).
  - Shoes and socks must be deposited in the Joda Ghar. Wash feet in the foot-cleaning water trough before stepping on marble.
  - Tobacco, alcohol, and leather items are strictly prohibited inside the complex.

- **North & Central Indian Temples (Kashi Vishwanath, Mahakaleshwar, Vaishno Devi)**:
  - Modest, clean attire covering shoulders and knees.
  - At Mahakaleshwar Bhasma Aarti, men wear unstitched cotton/silk Dhoti and women wear Sarees.

- **Sufi Dargahs & Mosques (Ajmer Sharif, Nizamuddin, Jama Masjid)**:
  - Modest clothing. Head coverings are customary for both men and women. Ensure footwear is left at designated stands.`;
    }

    // 3. Specific place queries
    if (q.includes("golden temple") || q.includes("amritsar") || q.includes("harmandir")) {
        return `### ☬ Shri Harmandir Sahib (Golden Temple), Amritsar

- **Significance**: The holiest shrine in Sikhism, symbolizing brotherhood, equality, and unconditional divine love.
- **Timings**: Open 24 hours a day, 365 days a year. The most serene time is during *Amrit Vela* (3:00 AM - 5:00 AM) and during the *Palki Sahib* ceremony at night (~9:30 PM).
- **Guru Ka Langar**: The world's largest free community kitchen serves over 100,000 pilgrims daily with warm, wholesome meals regardless of religion, caste, or background.
- **Sacred Sarovar**: Devotees take a cleansing dip (*Ishnan*) in the nectar pool surrounding the Golden Sanctum.
- **Nearby**: Jallianwala Bagh (300 m), Partition Museum (800 m), and Wagah Border ceremony (30 km).
- **Nearest Transit**: Amritsar Junction Railway Station (2.5 km), Sri Guru Ram Dass Jee International Airport (12 km).`;
    }

    if (q.includes("vaishno devi") || q.includes("katra") || q.includes("bhairon")) {
        return `### ⛰️ Shri Mata Vaishno Devi Shrine Guide (Katra, J&K)

- **The Divine Pindies**: Worship of Maa Mahakali, Maa Mahalakshmi, and Maa Mahasaraswati in natural rock formations.
- **The Trek**: 12 to 14 km from Katra to the Holy Bhawan via Banganga, Charan Paduka, and Adhkuwari Cave.
- **Conveniences**:
  - Battery cars available from Adhkuwari to Bhawan for elderly pilgrims.
  - Helicopter service connects Katra Heliport directly to Sanjichhat (2.5 km from Bhawan).
  - Passenger ropeway from Bhawan to **Bhairon Ghati** (Darshan is considered incomplete without Bhairon Nath darshan).
- **Registration**: RFID Yatra Access Card is mandatory and available free at Katra Railway Station and Katra bus stand, or pre-booked online on *maavaishnodevi.org*.`;
    }

    if (q.includes("budget") || q.includes("cheap") || q.includes("cost") || q.includes("money") || q.includes("dharamshala")) {
        return `### 💰 Budget Pilgrimage Tips across India

Traveling on a spiritual quest does not require a lavish budget:

1. **Accommodation**:
   - **Temple Trust Dharamshalas**: Almost every major shrine (TTD at Tirupati, GMVN in Uttarakhand, Kashi Trust in Varanasi, Gurudwara Sarai in Amritsar) offers clean rooms at ₹200 - ₹800/night.
   - **Ashram Stays**: Rishikesh, Haridwar, Varanasi, and Pondicherry host tranquil ashrams with free or nominal donation-based boarding.

2. **Satvik Food & Community Langars**:
   - Gurdwaras offer wholesome, unlimited free Langar with deep love and seva.
   - Most South Indian temples (Dharmasthala, Tirupati, Udupi, Puri) have vast *Annadanam* halls providing nutritious temple meals for all pilgrims.

3. **Transport**:
   - Use IRCTC sleeper and 3AC trains or state road transport (KSRTC, UPSRTC, HRTC).
   - Book government-operated yatra packages (like IRCTC Bharat Gaurav Tourist Trains) which bundle travel, food, and stays at affordable rates.

🧮 *Use our built-in [Budget Planner](/budget) from the navigation menu to calculate exact travel, stay, and meal costs based on your distance and days!*`;
    }

    // Default rich spiritual reply
    return `### 🙏 Divine Greetings from Divya Yatra AI!

I am here to guide your sacred journey across India's holy places. 

Here are popular ways I can help you right now:
- **Custom Itineraries**: Ask for a *1-day, 2-day, or 5-day plan* for Varanasi, Tirupati, Ayodhya, Kedarnath, Golden Temple, or Puri Jagannath.
- **Darshan & Timings**: Ask about temple opening hours, aarti timings, and online token booking.
- **Rules & Dress Codes**: Check what to wear and what items are allowed in each temple.
- **Budget & Dharamshalas**: Inquire about affordable trust stays and free Annadanam/Langar meals.
- **Travel Routes**: Get the best train, flight, or road connections to any holy shrine.

*What sacred destination or question is in your heart today?*`;
}

// Main AI Handler
async function getAIResponse(message, history = []) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try Gemini if configured
    if (geminiKey && geminiKey.trim() !== "" && !geminiKey.includes("<")) {
        try {
            return await callGemini(geminiKey, message, history);
        } catch (err) {
            console.error("Gemini call failed, falling back to local engine:", err.message);
        }
    }

    // 2. Try OpenAI if configured
    if (openaiKey && openaiKey.trim() !== "" && !openaiKey.includes("<")) {
        try {
            return await callOpenAI(openaiKey, message, history);
        } catch (err) {
            console.error("OpenAI call failed, falling back to local engine:", err.message);
        }
    }

    // 3. Fallback to Built-in Spiritual Knowledge Engine
    return getBuiltInResponse(message);
}

module.exports = {
    getAIResponse,
    getBuiltInResponse
};
