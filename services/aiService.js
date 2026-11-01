// services/aiService.js
// World-class AI Pilgrimage Intelligence Service with Gemini, OpenAI, and Deep Spiritual Knowledge Base.

const SYSTEM_PROMPT = `
You are 'Divya Yatra AI' (दिव्य यात्रा AI), the world's most revered, knowledgeable, and compassionate spiritual guide for Indian pilgrimages.
You represent the India Pilgrimage Guide platform, dedicated to assisting seekers, devotees, families, and solo travelers across all sacred traditions of India (Sanatana Dharma, Sikhism, Buddhism, Jainism, Sufism/Islam, Christianity, and indigenous spiritual sanctuaries).

Your guidance excels in:
1. Hour-by-Hour and Day-by-Day Spiritual Itineraries:
   - Morning Brahramuhurta / Mangala Aarti darshan
   - Sacred snan (holy dips in Ganga, Yamuna, Pushkar, Sarovar)
   - Afternoon cultural visits, serene ashram contemplation, and heritage walks
   - Sunset Ganga/Sarayu/Narmada Maha Aartis
2. Temple Darshan Protocols:
   - Official shrine board booking procedures (TTD, Shri Mata Vaishno Devi, Shri Kashi Vishwanath, Kedarnath-Badrinath BKTC, Somnath, Shirdi Sai Sansthan).
   - Strict dress codes (Dhoti, Kurta, Saree, Dupatta, restrictions on western clothes, leather, electronic gadgets, photography).
   - Senior Citizen, physically challenged (Divyangjan), and wheelchair accessibility assistance (battery cars, dolis, ropeways, VIP queues).
3. Travel & Transportation:
   - Nearest major railway junctions and airports with distance & travel duration.
   - Ghat boats, ropeway cable cars, trekking trails, and helicopter shuttle booking advice.
4. Accommodation & Dining:
   - Trust-managed Dharamshalas, spiritual Ashrams, and budget to luxury stays.
   - Holy Prasadam, free Community Langar & Annadanam timings, and pure Sattvic bhojan.
5. Mythology, Cultural Significance & Inner Peace:
   - Explaining spiritual lore with reverence, purity, and clarity.
   - Dos and don'ts to preserve the sanctity of each holy shrine.

Formatting Instructions:
- Spiritual, warm, and practical.
- Use clear markdown headers, bold highlights, concise bullet lists, and reverent emojis (🪔, 🕉️, ☬, 🏔️, 🛕, 🌸).
- Provide practical timings, approximate costs in INR (₹), and official advice.
`;

// Helper: Call Google Gemini REST API
async function callGemini(apiKey, prompt, history = []) {
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
        history.slice(-8).forEach(item => {
            const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
            contents.push({
                role: role,
                parts: [{ text: String(item.content || item.text || "") }]
            });
        });
    }

    contents.push({
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\nDevotee Query: ${prompt}` }]
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
                        maxOutputTokens: 1400
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
        history.slice(-8).forEach(item => {
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
            max_tokens: 1400
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (reply) return reply.trim();
    throw new Error("Empty response from OpenAI");
}

// Deep Built-In Spiritual Knowledge Engine (Zero-Configuration Fallback)
function getBuiltInResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. Ayodhya Ram Mandir
    if (q.includes("ayodhya") || q.includes("ram mandir") || q.includes("ram janmabhoomi")) {
        return `### 🛕 Shri Ram Janmabhoomi & Ayodhya Pilgrimage Guide

- **Sacred Essence**: The eternal birthplace of Bhagwan Shri Ram on the banks of the sacred river Sarayu.
- **Darshan Timings**:
  - Morning: 6:30 AM to 12:00 PM (Shringar & Bhog Aarti)
  - Evening: 2:00 PM to 10:00 PM (Sandhya & Shayan Aarti)
- **Essential Sacred Circuit**:
  1. **Hanuman Garhi**: According to tradition, you must first seek permission and blessings of Shri Hanuman before visiting Ram Lalla.
  2. **Shri Ram Janmabhoomi Mandir**: Marvel at the grand Nagara-style architecture and the consecrated Murti of Ram Lalla.
  3. **Kanak Bhawan**: The golden palace gifted to Devi Sita.
  4. **Sarayu Ghat & Evening Aarti (6:30 PM)**: Attend the grand musical Maha Aarti at Ram Ki Paidi.
- **Senior Citizen & Accessibility**: Wheelchairs, electric carts (golf carts) from Sugam Darshan points, and specialized lanes available.
- **Connectivity**: Maharishi Valmiki International Airport (AYJ) (10 km) and Ayodhya Dham Junction (AY) (1.5 km).`;
    }

    // 2. Char Dham & Uttarakhand
    if (q.includes("kedarnath") || q.includes("badrinath") || q.includes("char dham") || q.includes("gangotri") || q.includes("yamunotri")) {
        return `### 🏔️ Sacred Uttarakhand Char Dham Yatra Guide

**The Sacred Circuit Order**: Yamunotri ➔ Gangotri ➔ Kedarnath ➔ Badrinath (West to East).

- **Best Season**: May to June & September to October (monsoon months July-August are prone to landslides).
- **Mandatory Registration**: Biometric Yatra e-Pass is mandatory via *registrationandtouristcare.uk.gov.in*.
- **Kedarnath Trek & Transport**:
  - Trek distance: ~16 to 18 km starting from Gaurikund.
  - Alternatives: Helicopter shuttles from Phata, Sersi, or Guptkashi (book exclusively via IRCTC Heli Yatra portal), ponies (kandi), or palanquins (doli).
  - Night Stay: GMVN tents, cottages, and basic dharamshalas at Kedarnath Top.
- **Badrinath Dham Highlights**:
  - Holy dip in **Tapt Kund** (natural hot sulfur spring).
  - Darshan of Badri Vishal and exploration of **Mana Village** (Vyas Gufa, Saraswati River origin, Bhim Pul).
- **Medical Essentials**: Acclimatize in Guptkashi or Joshimath; carry thermal innerwear, rain poncho, portable oxygen can, and personal medicines.`;
    }

    // 3. Varanasi (Kashi)
    if (q.includes("varanasi") || q.includes("kashi") || q.includes("banaras")) {
        return `### 🕉️ Holy Kashi Vishwanath & Varanasi Yatra Blueprint

- **Spiritual Core**: The city of Mahadev, believed to bestow liberation (*Moksha*).
- **Day 1: The Divine Arrival & Ghats**:
  - Check-in near Godowlia or Assi Ghat.
  - 5:30 PM: Evening boat ride along Dashashwamedh Ghat to witness the world-famous **Ganga Aarti**.
- **Day 2: The Sacred Sanctum**:
  - 5:00 AM: Mangala Aarti or Sugam Darshan at the grand **Shri Kashi Vishwanath Dham Corridor**.
  - 8:30 AM: Seek blessings from **Kaal Bhairav** (the divine guardian of Kashi) and Sankat Mochan Temple.
  - 3:00 PM: Excursion to **Sarnath** (where Lord Buddha delivered the Dhammacakkappavattana Sutta).
- **Day 3: Sacred Snan & Heritage**:
  - Sunrise snan at Manikarnika or Dashashwamedh Ghat followed by traditional Banarasi *Kachori-Jalebi* and *Thandai*.
- **Transit**: Lal Bahadur Shastri International Airport (VNS) (25 km), Banaras (BSBS) & Varanasi Cantt (BSB) railway stations.`;
    }

    // 4. Tirupati Balaji
    if (q.includes("tirupati") || q.includes("balaji") || q.includes("venkateswara") || q.includes("tirumala")) {
        return `### 🛕 Sri Venkateswara Swami Temple (Tirupati Balaji)

- **The Presiding Deity**: Lord Venkateswara, the granter of boons in Kaliyuga, residing on the Seven Hills (Seshachalam).
- **Darshan Booking**:
  - Pre-book the **Special Entry Darshan (₹300)** 2-3 months in advance on the official TTD portal (*tirupatibalaji.ap.gov.in*).
  - Offline Sarva Darshan tokens (SSD) are issued free daily at Tirupati town counters.
- **Strict Dress Code**:
  - **Men**: Dhoti and Angavastram, or Kurta-Pyjama. (T-shirts, jeans, and shorts are strictly forbidden).
  - **Women**: Traditional Saree, Half-Saree, or Chudidar with Dupatta.
- **Key Rituals**:
  - Head tonsuring (Kalyanakatta) as an offering of ego.
  - Holy dip in Swami Pushkarini sacred lake.
  - Partaking in the divine **Tirupati Laddoo Prasadam** and free Tarigonda Vengamamba Annaprasadam.`;
    }

    // 5. Golden Temple (Harmandir Sahib)
    if (q.includes("golden temple") || q.includes("amritsar") || q.includes("harmandir")) {
        return `### ☬ Sri Harmandir Sahib (Golden Temple), Amritsar

- **Universal Divinity**: Four entrances welcoming souls from all walks of life, symbolizing absolute equality and humility.
- **Timings**: Open 24 hours. The sanctum sparkles under starlight; the *Palki Sahib* ceremony (night transfer) and *Amrit Vela* (3:30 AM) are profoundly moving.
- **Guru Ka Langar**: Serves hot, freshly prepared wholesome vegetarian meals to 100,000+ devotees daily with selfless love (*Seva*).
- **Sacred Etiquette**:
  - Keep your head covered at all times (cloth scarfs available at entry).
  - Wash hands and feet at the entry trough before walking on the Parikrama marble.
  - Photography of the sanctum interior is prohibited.
- **Nearby**: Jallianwala Bagh (300 m), Partition Museum (800 m), and Wagah Border (30 km).`;
    }

    // 6. 12 Jyotirlingas Overview
    if (q.includes("jyotirlinga") || q.includes("shiva") || q.includes("mahakal") || q.includes("somnath") || q.includes("trimbak")) {
        return `### 🔱 The 12 Divine Jyotirlingas of Bharat

The supreme radiant pillars of Bhagwan Shiva:
1. **Somnath** (Gujarat) - The First Shrine, overlooking the Arabian Sea.
2. **Mallikarjuna** (Srisailam, Andhra Pradesh) - Shaktipeeth & Jyotirlinga combined.
3. **Mahakaleshwar** (Ujjain, MP) - Famous for the 4:00 AM sacred Bhasma Aarti.
4. **Omkareshwar** (MP) - Island shrine shaped like the sacred Om symbol in Narmada.
5. **Kedarnath** (Uttarakhand) - Highest Jyotirlinga in the Himalayas (3,583 m).
6. **Bhimashankar** (Maharashtra) - In the Sahyadri mountains near Pune.
7. **Kashi Vishwanath** (Varanasi, UP) - The eternal light of liberation.
8. **Trimbakeshwar** (Nashik, Maharashtra) - Origin of Godavari river, three-faced lingam.
9. **Baidyanath Dham** (Deoghar, Jharkhand) - The divine healer (Arogya).
10. **Nageshwar** (Dwarka, Gujarat) - Protector from negative energies.
11. **Ramanathaswamy** (Rameswaram, Tamil Nadu) - Consecrated by Lord Rama, 22 holy theertham wells.
12. **Grishneshwar** (Ellora, Maharashtra) - Near the ancient Ellora Caves.

💡 *Ask me for a detailed route or darshan plan for any specific Jyotirlinga!*`;
    }

    // 7. Puri Jagannath
    if (q.includes("puri") || q.includes("jagannath") || q.includes("odisha")) {
        return `### 🌊 Shri Jagannath Temple, Puri Dham

- **Spiritual Essence**: One of the Chardham shrines, abode of Lord Jagannath, Balabhadra, and Devi Subhadra.
- **Mahaprasad (Chappan Bhog)**: Cooked in earthen pots placed one atop another on wood fires; available at the historic Anand Bazar.
- **Sacred Mysteries**: The temple flag (*Patitapavana*) always flutters opposite to the wind direction, and no birds or planes fly over the sanctum.
- **World Famous Rath Yatra**: Held in June/July (Ashadha Shukla Dwitiya), where the deities journey on majestic wooden chariots.
- **Nearby**: Golden Beach (Blue Flag certified), Konark Sun Temple (35 km), and Chilika Lake.`;
    }

    // 8. General Itinerary / Multi-day requests
    if (q.includes("itinerary") || q.includes("plan") || q.includes("days") || q.includes("day") || q.includes("trip")) {
        return `### 🗓️ Bespoke Spiritual Yatra Itinerary Framework

Here is a tried-and-tested rhythm for any sacred pilgrimage in India:

- **Morning (Brahma Muhurta - 5:00 AM to 8:30 AM)**:
  - Holy snan in the sacred river/kund/sarovar.
  - First darshan / Mangala Aarti when the spiritual aura is purest and crowds are gentle.
- **Mid-Morning to Noon**:
  - Visiting parikrama shrines, sacred banyan trees, and holy caves.
  - Partaking in temple **Prasadam** or free community **Annadanam/Langar**.
- **Afternoon (Rest & Introspection)**:
  - Rest at your ashram or dharamshala during mid-day temple closing hours (typically 12:30 PM to 4:00 PM).
  - Spiritual reading, satsang, or museum/heritage exploration.
- **Evening (Dusk to Night)**:
  - Attend the grand sunset **Maha Aarti** with chanting, conch shells, and lamps.
  - Peaceful stroll along the ghats or temple corridors under twilight.

✨ *Tell me your desired destination, number of days, and who is traveling with you, and I will generate an exact hour-by-hour itinerary!*`;
    }

    // 9. Budget & Dharamshala
    if (q.includes("budget") || q.includes("cheap") || q.includes("save") || q.includes("dharamshala") || q.includes("cost")) {
        return `### 💰 Smart & Budget-Friendly Pilgrimage Wisdom

A sacred pilgrimage can be profoundly rich without high expenses:

1. **Stays (₹200 - ₹800/day)**:
   - Stay at official **Shrine Board Guesthouses** (e.g. TTD Srinivasam at Tirupati, GMVN in Uttarakhand, Kashi Trust, Gurudwara Sarais).
   - Clean, spiritual ashrams in Haridwar, Rishikesh, Varanasi, and Pondicherry often accept modest donations.
2. **Nourishing Food (₹0 - ₹150/day)**:
   - Partake in **Langar** at Sikh Gurdwaras (wholesome dal, rotis, kheer served unconditionally).
   - South Indian temple **Annadanam** halls (Tirupati, Dharmasthala, Udupi, Puri) offer pure, hygienic sattvic meals free for every pilgrim.
3. **Transport Optimization**:
   - Travel via IRCTC Sleeper or 3AC trains booked in advance.
   - Use government state transport buses (APSRTC, KSRTC, UPSRTC) directly linking stations to holy shrines.
4. **Budget Planner**:
   - Use our built-in [Budget Planner](/budget) tool in the top navigation to compute accurate fuel, tickets, and lodging costs.`;
    }

    // Default Warm Divine Response
    return `### 🙏 Divine Greetings from Divya Yatra AI!

May peace, clarity, and auspiciousness surround your sacred journey.

Here are the ways I can guide you today:
- **Comprehensive Itineraries**: 1-day, 2-day, 3-day, or 7-day plans for Ayodhya, Varanasi, Kedarnath, Tirupati, Golden Temple, Shirdi, or Rameswaram.
- **Darshan Guidelines**: Exact aarti timings, dress code requirements, VIP passes, and online booking portals.
- **Pilgrim Support**: Senior citizen & wheelchair facilities, medical advice for high altitudes, and sattvic food recommendations.
- **Logistics**: Nearest railway junctions, airport transfers, ropeways, and dharamshala stays.

*Please share your destination or question, and let us illuminate your spiritual path!*`;
}

// Main AI Generator Function
async function getAIResponse(message, history = []) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey && geminiKey.trim() !== "" && !geminiKey.includes("<")) {
        try {
            return await callGemini(geminiKey, message, history);
        } catch (err) {
            console.warn("Gemini call failed, utilizing local spiritual knowledge engine:", err.message);
        }
    }

    if (openaiKey && openaiKey.trim() !== "" && !openaiKey.includes("<")) {
        try {
            return await callOpenAI(openaiKey, message, history);
        } catch (err) {
            console.warn("OpenAI call failed, utilizing local spiritual knowledge engine:", err.message);
        }
    }

    return getBuiltInResponse(message);
}

module.exports = {
    getAIResponse,
    getBuiltInResponse
};
