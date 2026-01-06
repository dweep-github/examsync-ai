# 📚 ExamSync AI

ExamSync AI is a highly intelligent study strategist designed to help students synchronize their study schedules with upcoming exam dates. It prioritizes weak areas and adapts its advice based on how much time is left before your big day.

## ✨ Features

* **Smart Timeline Adaptation:** Changes its strategy based on time remaining (e.g., deep learning for 30+ days vs. panic control for <1 day).
* **Topic Tracker:** Dynamically manage your syllabus, marking topics as pending, weak, or completed.
* **AI Study Companion:** Powered by Gemini (gemma-3-27b) to provide tailored study plans and motivation.
* **Immersive UI:** Features high-quality animations including a Galaxy background and a Target Cursor.
* **Dark Mode:** Full support for dark and light modes with persistent user preferences.

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS
* **AI:** Google Gemini API (@google/genai)
* **Backend/Auth:** Firebase (Google Auth)
* **Animations:** GSAP, Framer Motion
* **Bundler:** Vite

## 🚀 Getting Started

### Prerequisites

* Node.js (v20 or higher)
* A Gemini API Key from Google AI Studio

### Local Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/examsync-ai.git](https://github.com/YOUR_USERNAME/examsync-ai.git)
   cd examsync-ai
Install dependencies:

Bash

npm install
Configure Environment Variables: Create a .env.local file in the root directory and add your key:

Code snippet

GEMINI_API_KEY=your_api_key_here
Run the development server:

Bash

npm run dev
