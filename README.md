# UI Friction Detector ⚡

Real-time UX intelligence layer for any website. Think: Lighthouse meets a senior UX designer, living inside your browser.

## Features
- **10 Core UX Modules**: Audit contrast, tap targets, performance (CLS/FID), cognitive load, and more.
- **Visual Overlay**: Highlighting issues directly on the page with tooltips.
- **AI Advisor**: Get custom redesign suggestions from Claude API.
- **😈 Roast Mode**: Brutally honest UX feedback.
- **JSON Export**: Download full reports for your team.

## Setup Instructions
1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `ui-friction-detector` folder.
5. (Optional) To enable AI Advisor, add your Anthropic API key in `popup/popup.js`.

## Usage
- Click the extension icon to open the dashboard.
- Click **Scan This Page** to run the audit.
- Hover over issues in the list to see them highlighted on the page.
- Toggle **Roast Mode** for some "tough love" UX advice.

## Tech Stack
- Manifest V3
- Vanilla JavaScript
- Performance & Mutation Observers
- CSS Grid & Flexbox
- Anthropic Claude API
