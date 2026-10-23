# 🛕 INDIA PILGRIMAGE

> A responsive, full-stack India pilgrimage web application showcasing famous sacred destinations across India, complete with search, place details, interactive lightbox view, and a Pilgrimage Budget Planner.

---

## 🚀 Features

- **Explore Sacred Destinations**: Detailed listings with visiting hours, nearby attractions, and nearest railway station.
- **Search Functionality**: Case-insensitive instant search across pilgrimage destinations.
- **Interactive Lightbox View**: Click on place cards to open a modal view with high-res details.
- **Budget Planner**: Calculate estimated trip budgets based on distance, travel mode, accommodation, and food.
- **Authentication**: User registration and login powered by Passport.js.
- **Production & Vercel Ready**: Optimized for serverless deployment on Vercel with MongoDB Atlas support.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **View Engine**: EJS, EJS-Mate
- **Database**: MongoDB with Mongoose ODM
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
   MONGODB_URI=mongodb://127.0.0.1:27017/visit
   SESSION_SECRET=your_secret_key
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

1. **Push your code to GitHub** (this repository is already linked to `origin`).
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository: `abhayraj04/INDIA-PILGRIMAGE`.
4. In the **Environment Variables** section on Vercel, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/visit?retryWrites=true&w=majority`)
   - `SESSION_SECRET`: A secure random secret string for session cookies.
5. Click **Deploy**. Vercel will build and launch your application seamlessly!
