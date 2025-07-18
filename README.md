# 3MTT ExplainIt AI

## Project Description
This is a simple web application designed to help 3MTT fellows and other beginners understand complex technical documentation and jargon. It leverages the Google Gemini AI to provide simplified summaries and explanations of technical terms.

## Features
- **AI-Powered Explanations:** Utilizes Google Gemini's capabilities to simplify complex text.
- **Jargon Demystification:** Identifies and explains technical terms in easy-to-understand language.
- **User-Friendly Interface:** Simple input and output fields for quick explanations.

## Technologies Used
- HTML (for structure)
- CSS (for styling)
- JavaScript (for logic and API interaction)
- Google Gemini API (for AI explanations)

## How to Use
1. Paste your complex technical text into the large input box.
2. (Optional) Enter a specific question you have about the text in the "Ask a specific question" field.
3. Click the "Explain with AI" button.
4. The AI-generated explanation will appear in the output area.

## Setup (For local development)
1. **Clone this repository:** `git clone https://github.com/YOUR_USERNAME/3MTT-ExplainIt-AI.git`
2. **Navigate to the project directory:** `cd 3MTT-ExplainIt-AI`
3. **Obtain a Google Gemini API Key:** Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a new API key.
4. **Configure API Key:** Open `script.js` and replace `"YOUR_GEMINI_API_KEY"` with your actual API key:
    `const API_KEY = "AIzaSy_YOUR_ACTUAL_LONG_API_KEY_HERE";`
5. **Run a local web server(to avoid CORS issues):**
    * If you have Node.js installed, open your terminal in the project directory and run `npx http-server` (or `npm install -g http-server` then `http-server`).
    * Alternative, use a VS Code extension like Live Server.
6. Open your browser and navigate to `http://localhost:8080` (or whatever port your server is running on).

## Live Demo
You can see a live demo of this project here:
[https://YOUR_USERNAME.github.io/3MTT-ExplainIt-AI/](https://Anngeljones.github.io/3MTT-ExplainIt-AI/)

## Author
[Angel Jones/Anngeljones]
