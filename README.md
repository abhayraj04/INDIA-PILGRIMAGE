# 🛕 INDIA PILGRIMAGE

> A responsive, full-stack India pilgrimage web application showcasing sacred destinations across India, complete with search, place details, interactive lightbox view, Pilgrimage Budget Planner, and **Divya Yatra AI** — an intelligent spiritual travel companion.

---

## 🚀 Features

- **✨ Divya Yatra AI Companion**:
  - **Custom Itinerary Planner**: Instant day-by-day spiritual tour plans (e.g., 3-day Varanasi, 5-day Kedarnath-Badrinath, 2-day Tirupati Balaji).
  - **Darshan & Ritual Guidance**: Accurate aarti schedules, VIP token procedures, and temple dress codes.
  - **Smart Hybrid AI**: Works live with **Google Gemini AI** (`GEMINI_API_KEY`) or **OpenAI**, with a built-in offline spiritual intelligence engine if no key is configured.
  - **Floating AI Assistant**: Available seamlessly on every single page via an interactive bottom-right widget.
  - **Dedicated Fullscreen AI Guide**: Accessible via `/ai-guide` with quick prompt chips and conversation history.
- **Explore Sacred Destinations**: Detailed listings with visiting hours, nearby attractions, and nearest railway station.
- **Search Functionality**: Case-insensitive instant search across pilgrimage destinations.
- **Interactive Lightbox View**: Click on place cards to open a modal view with high-res details.
- **Budget Planner**: Calculate estimated trip budgets based on distance, travel mode, accommodation, and food.
- **Authentication**: User registration and login powered by Passport.js.
- **Production & Vercel Ready**: Optimized for serverless deployment on Vercel with MongoDB Atlas and zero-config local fallbacks.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Artificial Intelligence**: Google Gemini API / OpenAI API / Built-in Spiritual Knowledge Engine
- **View Engine**: EJS, EJS-Mate
- **Database**: MongoDB with Mongoose ODM (with automatic offline fallback)
- **Authentication**: Passport.js, Passport-Local
- **Deployment**: Vercel Serverless Functions

---

## 📦 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhayraj04/INDIA-PILGRIMAGE.git
   cd INDIA-PILGRIMAGE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   # Database (optional - fallback data used if not provided)
   MONGODB_URI=mongodb://127.0.0.1:27017/visit
   SESSION_SECRET=your_secret_key

   # AI Assistant (optional - built-in engine used if no key is set)
   GEMINI_API_KEY=your_google_gemini_api_key_here

   PORT=8080
   ```

4. **Initialize Database (Optional / First Run):**
   ```bash
   node init/index.js
   ```

5. **Start the Application:**
   ```bash
   npm start
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ☁️ Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. In your [Vercel Dashboard](https://vercel.com), the connected repository will automatically rebuild and deploy!
3. *(Optional)* Add Environment Variables under **Project Settings > Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API Key for live AI responses.
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `SESSION_SECRET`: A secret string for session cookies.
