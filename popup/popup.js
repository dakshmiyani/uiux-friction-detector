/**
 * UI Friction Detector - Stable AI Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn      = document.getElementById('scan-btn');
  const rescanBtn    = document.getElementById('rescan-btn');
  const roastToggle  = document.getElementById('roast-toggle');
  const aiAdvisorBtn = document.getElementById('ai-advisor-btn');
  const exportBtn    = document.getElementById('export-btn');
  const issuesList   = document.getElementById('issues-list');
  const issueCount   = document.getElementById('issue-count');
  const settingsBtn  = document.getElementById('settings-btn');
  const settingsPanel= document.getElementById('settings-panel');
  const groqKeyInput = document.getElementById('groq-api-key');
  const saveKeyBtn   = document.getElementById('save-key-btn');
  const keyStatus    = document.getElementById('key-status');
  const urlDisplay   = document.getElementById('current-url');
  const staleOverlay = document.getElementById('stale-overlay');
  
  let currentIssues = [];
  let isRoasting = false;

  // ---- Robust JSON Extractor ----
  function extractAndParseJSON(text) {
    try {
      // Look for the first '[' or '{' and the last ']' or '}'
      const start = text.search(/[\[\{]/);
      const end = text.lastIndexOf(text.match(/[\]\}]/)?.[0]);
      if (start === -1 || end === -1) throw new Error("No JSON found");
      const cleanJson = text.substring(start, end + 1);
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Extraction failed:", e, "Raw text:", text);
      throw e;
    }
  }

  // ---- URL Context & Sync Check ----
  async function updateUrlDisplay() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    urlDisplay.textContent = tab.url;
    
    chrome.storage.local.get(['lastScan'], (result) => {
      const isMismatch = result.lastScan && result.lastScan.url !== tab.url;
      if (isMismatch) {
        urlDisplay.classList.add('mismatch');
        staleOverlay.classList.remove('hidden');
      } else {
        urlDisplay.classList.remove('mismatch');
        staleOverlay.classList.add('hidden');
      }
    });
  }
  updateUrlDisplay();

  // ---- Skeleton Loader ----
  function renderSkeletons(count = 5) {
    issuesList.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card skeleton-pulse';
        card.innerHTML = `
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line"></div>
        `;
        issuesList.appendChild(card);
    }
  }

  // ---- Settings panel ----
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    if (!settingsPanel.classList.contains('hidden')) {
      chrome.storage.local.get(['groqApiKey'], (r) => {
        groqKeyInput.value = r.groqApiKey || '';
        if (r.groqApiKey) {
          keyStatus.textContent = '✅ API key saved';
          keyStatus.className = 'key-status ok';
        } else {
          keyStatus.textContent = 'No key saved — AI Advisor fallback active';
          keyStatus.className = 'key-status';
        }
      });
    }
  });

  saveKeyBtn.addEventListener('click', () => {
    const key = groqKeyInput.value.trim();
    if (!key) {
      chrome.storage.local.remove('groqApiKey');
      keyStatus.textContent = '🗑 Key cleared';
      keyStatus.className = 'key-status';
      return;
    }
    if (!key.startsWith('gsk_')) {
      keyStatus.textContent = '❌ Invalid key — Groq keys start with gsk_';
      keyStatus.className = 'key-status err';
      return;
    }
    chrome.storage.local.set({ groqApiKey: key }, () => {
      keyStatus.textContent = '✅ Key saved! Audit is now AI-First.';
      keyStatus.className = 'key-status ok';
    });
  });

  // Initialize from storage
  chrome.storage.local.get(['lastScan'], (result) => {
    if (result.lastScan) {
      currentIssues = result.lastScan.issues;
      updateUI(result.lastScan);
    }
  });

  const performScan = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      alert("Cannot scan this page.");
      return;
    }

    scanBtn.innerText = 'Analyzing...';
    scanBtn.disabled = true;
    staleOverlay.classList.add('hidden');
    renderSkeletons(6);
    document.querySelector('.score-ring').classList.add('pulse');

    try {
      chrome.tabs.sendMessage(tab.id, { action: "clearHighlights" });
      const snapshot = await chrome.tabs.sendMessage(tab.id, { action: "getDeepPageSnapshot" });
      
      const aiIssues = await runDeepAIAudit(snapshot);
      currentIssues = aiIssues;
      
      const scores = calculateScores(currentIssues);
      const scanData = { issues: currentIssues, scores, url: tab.url, time: new Date().toISOString() };
      
      chrome.storage.local.set({ lastScan: scanData });
      updateUI(scanData);
      updateUrlDisplay();

    } catch (e) {
      console.error("Scan failed", e);
      issuesList.innerHTML = `<div class="empty-state">Scan failed. Refresh page and try again.</div>`;
    } finally {
      scanBtn.innerText = 'Scan This Page';
      scanBtn.disabled = false;
      document.querySelector('.score-ring').classList.remove('pulse');
    }
  };

  scanBtn.addEventListener('click', performScan);
  rescanBtn.addEventListener('click', performScan);

  async function runDeepAIAudit(snapshot) {
    const stored = await chrome.storage.local.get(['groqApiKey']);
    const API_KEY = stored.groqApiKey || '';
    
    if (!API_KEY) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: "runAudit" });
      return (response.issues || []).map(i => ({...i, ufdId: null}));
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          messages: [{
            role: 'system',
            content: `You are a brutally honest, world-class UX Designer and Conversion Rate Optimizer with 20+ years experience at top tech companies. You have deep expertise in cognitive psychology, WCAG accessibility standards, mobile-first design, and data-driven UX research.

Analyze the provided webpage snapshot and identify exactly 8 UX friction points. Be specific, actionable, and ruthless — vague feedback is useless.

For each friction point, evaluate across these dimensions:
- Visual hierarchy & attention flow
- Cognitive load & decision fatigue
- CTA clarity, placement & conversion impact
- Color contrast & WCAG AA/AAA compliance
- Typography readability & hierarchy
- Spacing, layout density & whitespace usage
- Mobile tap target sizes (min 44×44px)
- Form UX & input friction
- Trust signals & social proof placement
- Above-the-fold content effectiveness
- Loading states & feedback mechanisms
- Error prevention & recovery patterns
- Navigation clarity & information architecture
- Emotional design & micro-interactions

Severity rules:
- "critical" = directly kills conversions or accessibility (contrast failure, broken CTA, invisible primary action)
- "warning" = degrades experience significantly (poor hierarchy, small targets, vague labels)
- "info" = polish-level improvements (spacing, tone, micro-copy)

Category must be one of: "usability" | "accessibility" | "performance" | "design" | "psychology" | "copywriting" | "conversion"

score_impact rules:
- 8–10 = conversion killer or accessibility blocker
- 5–7 = significant friction affecting most users
- 1–4 = polish or edge-case improvement

roast = same issue rewritten in savage, witty, punchy tone (max 15 words). Make it memorable and slightly brutal.

suggestion must be:
- Specific and immediately actionable (not "improve contrast" — say "change text to #1A1A1A on white for 7.5:1 ratio")
- Reference real UX principles, heuristics, or data where relevant
- Include a measurable outcome where possible ("can increase CTR by 15–30%")

ufdId = the exact "ufdId" string from the provided Snapshot elements (e.g., "btn-0", "img-4"). Use null if the issue is page-wide.

Return ONLY a valid JSON array. No markdown, no explanation, no preamble. Exactly 8 objects.

[{ "id": "string", "category": "usability|accessibility|performance|design|psychology|copywriting|conversion", "severity": "critical|warning|info", "problem": "...", "suggestion": "...", "roast": "...", "score_impact": 1-10, "ufdId": "btn-0" }]`
          }, {
            role: 'user',
            content: `Snapshot: ${JSON.stringify(snapshot)}`
          }]
        })
      });
      const data = await response.json();
      return extractAndParseJSON(data.choices[0].message.content).map((i, idx) => ({ ...i, index: idx }));
    } catch (e) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: "runAudit" });
      return (response.issues || []).map(i => ({...i, ufdId: null}));
    }
  }

  roastToggle.addEventListener('change', (e) => {
    isRoasting = e.target.checked;
    renderIssues();
  });

  aiAdvisorBtn.addEventListener('click', async () => {
    if (currentIssues.length === 0) return alert("Run a scan first!");
    document.getElementById('ai-response-card').classList.remove('hidden');
    document.getElementById('ai-content').innerHTML = "🧠 Consulting Groq UX Architect...";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const snapshot = await chrome.tabs.sendMessage(tab.id, { action: "getDeepPageSnapshot" });
      const summaryResults = await callGroqAdvisor(currentIssues, snapshot);
      renderAIResponse(summaryResults);
    } catch (e) {
      document.getElementById('ai-content').innerText = "AI Advisor failed. Check API key.";
    }
  });

  async function callGroqAdvisor(issues, snapshot) {
    const stored = await chrome.storage.local.get(['groqApiKey']);
    const API_KEY = stored.groqApiKey || '';
    if (!API_KEY) return buildLocalAIAnalysis(issues);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'You are a UX Architect. Respond ONLY with JSON: { "summary": "...", "topFixes": [{"fix": "..."}], "quickWin": "..." }'
        }, {
          role: 'user',
          content: `Layout: ${JSON.stringify(snapshot.layout)}\nIssues: ${JSON.stringify(issues)}`
        }]
      })
    });
    const data = await response.json();
    return extractAndParseJSON(data.choices[0].message.content);
  }

  function updateUI(data) {
    const { scores, issues } = data;
    const scoreVal = document.getElementById('overall-score');
    scoreVal.innerText = scores.overall;
    const offset = 283 - (283 * (scores.overall / 100));
    document.getElementById('score-circle').style.strokeDashoffset = offset;

    document.getElementById('score-usability').style.width = scores.categories.usability + '%';
    document.getElementById('score-accessibility').style.width = scores.categories.accessibility + '%';
    document.getElementById('score-performance').style.width = scores.categories.performance + '%';
    document.getElementById('score-design').style.width = scores.categories.design + '%';

    issueCount.innerText = issues.length;
    renderIssues();
  }

  function renderIssues() {
    issuesList.innerHTML = '';
    if (currentIssues.length === 0) {
      issuesList.innerHTML = '<div class="empty-state">No issues yet.</div>';
      return;
    }

    currentIssues.forEach(issue => {
      const card = document.createElement('div');
      card.className = `issue-card ${issue.severity}`;
      const problemText = isRoasting ? (issue.roast || roastify(issue)) : issue.problem;
      card.innerHTML = `<div class="issue-header">${problemText}<span class="ai-tag">AI</span></div><div class="issue-desc">💡 ${issue.suggestion}</div>`;
      card.onclick = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: "highlightIssue", ufdId: issue.ufdId, index: issue.index, severity: issue.severity, problem: issue.problem, suggestion: issue.suggestion });
      };
      issuesList.appendChild(card);
    });
  }

  function buildLocalAIAnalysis(issues) {
    return { summary: "Technical analysis complete. View individual issues for fixes.", topFixes: issues.slice(0,2).map(i=>({fix:i.problem})), quickWin: issues[0]?.problem || "None" };
  }

  function renderAIResponse(data) {
    const container = document.getElementById('ai-content');
    container.innerHTML = `<div class="ai-section"><h5>Summary</h5><p>${data.summary}</p></div><div class="ai-section"><h5>Fixes</h5><ul>${data.topFixes.map(f => `<li>${f.fix}</li>`).join('')}</ul></div><div class="ai-section"><h5>Quick Win</h5><p>${data.quickWin}</p></div>`;
  }

  exportBtn.addEventListener('click', () => {
    if (currentIssues.length === 0) return;
    
    chrome.storage.local.get(['lastScan'], (result) => {
      const data = result.lastScan;
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>UX Audit Report - ${data.url}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Space+Mono&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #0D0D0D; --card: #1A1A1A; --accent: #BAFF29; --text: #E0E0E0; }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; margin: 0; padding: 40px; }
    .report-header { border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 40px; }
    h1 { color: var(--accent); margin: 0; font-family: 'Space Mono'; text-transform: uppercase; font-size: 24px; }
    .meta { opacity: 0.6; font-size: 14px; margin-top: 10px; }
    .score-summary { display: flex; gap: 40px; margin-bottom: 40px; background: var(--card); padding: 30px; border-radius: 12px; align-items: center; }
    .score-big { font-size: 64px; font-family: 'Space Mono'; color: var(--accent); }
    .score-label { font-size: 12px; text-transform: uppercase; opacity: 0.5; letter-spacing: 1px; }
    .issue-card { background: var(--card); border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 5px solid #333; }
    .issue-card.critical { border-left-color: #FF4136; }
    .issue-card.warning { border-left-color: #FF851B; }
    .issue-header { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; display: flex; justify-content: space-between; }
    .severity-badge { font-size: 10px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; background: #333; }
    .problem { margin-bottom: 15px; line-height: 1.6; }
    .suggestion { background: rgba(186, 255, 41, 0.1); padding: 15px; border-radius: 8px; border: 1px dashed var(--accent); color: #fff; font-size: 14px; }
    .roast { font-style: italic; opacity: 0.5; font-size: 12px; margin-top: 10px; border-top: 1px solid #222; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>UI Friction Audit Report</h1>
    <div class="meta">
      URL: <strong>${data.url}</strong><br>
      Date: ${new Date(data.time).toLocaleString()}
    </div>
  </div>

  <div class="score-summary">
    <div>
      <div class="score-big">${data.scores.overall}</div>
      <div class="score-label">Overall UX Score</div>
    </div>
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div><div class="score-label">Usability</div><strong>${data.scores.categories.usability}%</strong></div>
      <div><div class="score-label">Accessibility</div><strong>${data.scores.categories.accessibility}%</strong></div>
      <div><div class="score-label">Performance</div><strong>${data.scores.categories.performance}%</strong></div>
      <div><div class="score-label">Design</div><strong>${data.scores.categories.design}%</strong></div>
    </div>
  </div>

  <h2>Found Frictions (${data.issues.length})</h2>
  ${data.issues.map(issue => `
    <div class="issue-card ${issue.severity}">
      <div class="issue-header">
        <span>${issue.category.toUpperCase()} Issue</span>
        <span class="severity-badge">${issue.severity}</span>
      </div>
      <div class="problem"><strong>Problem:</strong> ${issue.problem}</div>
      <div class="suggestion"><strong>Recommended Fix:</strong> ${issue.suggestion}</div>
      <div class="roast">Roast: "${issue.roast || 'N/A'}"</div>
    </div>
  `).join('')}

  <footer style="margin-top: 60px; opacity: 0.4; font-size: 12px; text-align: center;">
    Generated by UI Friction Detector AI Advisor
  </footer>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ufd_audit_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.querySelector('.close-card').onclick = () => document.getElementById('ai-response-card').classList.add('hidden');
});
