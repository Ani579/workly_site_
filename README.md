# Workly: Match. Learn. Grow.

An AI-powered platform that matches students with jobs and helps them grow their careers.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- Auth.js (NextAuth) + Google OAuth
- Google Gemini AI

## Getting Started

1. **Clone the repository** (if not already done).
2. **Install dependencies**: `npm install`
3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in the values:
   - `MONGODB_URI`: Create a free MongoDB database on [MongoDB Atlas](https://www.mongodb.com/atlas) and paste the connection string here.
   - `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: Create an OAuth credential in the [Google Cloud Console](https://console.cloud.google.com/), add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs.
   - `AUTH_SECRET`: Generate a random string (e.g., using `openssl rand -base64 32`) and paste it here.
   - `GEMINI_API_KEY`: Get a free API key from [Google AI Studio](https://aistudio.google.com/).
4. **Run the Development Server**:
   Start the app using `npm run dev`.
5. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000) to see the landing page.
