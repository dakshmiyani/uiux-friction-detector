/**
 * UI Friction Detector - Visual Overlay
 */

const UFD_OVERLAY_ID = 'ufd-friction-overlay';

function createOverlay() {
  let overlay = document.getElementById(UFD_OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = UFD_OVERLAY_ID;
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${h}px;
      pointer-events: none;
      z-index: 2147483647;
    `;
    document.body.appendChild(overlay);

    // Add dismiss button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕ Close UI Audit';
    closeBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #BAFF29;
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      pointer-events: auto;
      z-index: 2147483647;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      font-family: sans-serif;
    `;
    closeBtn.onclick = () => {
      overlay.remove();
      // Also potentially clear outlines on original elements if we used outlines
    };
    overlay.appendChild(closeBtn);
  }
  return overlay;
}

function highlightElement(el, severity, problem, suggestion) {
  const overlay = createOverlay();
  const rect = el.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const severityColors = {
    critical: '#FF4136',
    warning: '#FF851B',
    info: '#0074D9'
  };

  const color = severityColors[severity] || '#BAFF29';

  const div = document.createElement('div');
  div.className = `ufd-highlight ufd-${severity}`;
  div.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollY}px;
    left: ${rect.left + scrollX}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 3px solid ${color};
    box-shadow: 0 0 15px ${color}, inset 0 0 10px ${color};
    pointer-events: none;
    box-sizing: border-box;
    z-index: 2147483647;
    animation: ufd-glow 1s infinite alternate;
  `;

  // Add the animation if not already present
  if (!document.getElementById('ufd-styles')) {
    const style = document.createElement('style');
    style.id = 'ufd-styles';
    style.textContent = `
      @keyframes ufd-glow {
        from { opacity: 0.6; box-shadow: 0 0 5px ${color}; }
        to { opacity: 1; box-shadow: 0 0 20px ${color}; }
      }
    `;
    document.head.appendChild(style);
  }

  // Badge/Tooltip
  const badge = document.createElement('div');
  badge.innerText = '!';
  badge.style.cssText = `
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: ${color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    cursor: help;
    pointer-events: auto;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  `;
  
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    visibility: hidden;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    white-space: normal;
    width: 200px;
    z-index: 2147483647;
    border: 1px solid ${color};
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    font-family: sans-serif;
  `;
  tooltip.innerHTML = `<strong>${problem}</strong><br><span style="color: #BAFF29">💡 ${suggestion}</span>`;
  
  badge.onmouseover = () => tooltip.style.visibility = 'visible';
  badge.onmouseout = () => tooltip.style.visibility = 'hidden';
  
  badge.appendChild(tooltip);
  div.appendChild(badge);
  overlay.appendChild(div);
}

// Clear all highlights
function clearHighlights() {
  const overlay = document.getElementById(UFD_OVERLAY_ID);
  if (overlay) overlay.remove();
}

// Map globally if needed
window.ufdOverlay = { highlightElement, clearHighlights };
