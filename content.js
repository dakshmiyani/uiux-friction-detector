/**
 * UI Friction Detector Engine
 */

class FrictionDetector {
  constructor() {
    this.issues = [];
    this.elementMap = new Map(); // Store elements for highlighting
    this.stats = {
      interactiveCount: 0,
      layoutShiftScore: 0,
      firstInputDelay: 0
    };
    this.setupObservers();
  }

  setupObservers() {
    // Layout Shift
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            this.stats.layoutShiftScore += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) { console.warn("Layout shift observation failed"); }

    // First Input Delay
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          this.stats.firstInputDelay = entries[0].processingStart - entries[0].startTime;
        }
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) { console.warn("FID observation failed"); }
  }

  async runAudit() {
    this.issues = [];
    this.elementMap.clear(); // CRITICAL: Clear map on every audit
    this.stats.interactiveCount = document.querySelectorAll('button, a, input[type=submit], input[type=button], [role=button]').length;

    // Run all modules
    this.checkCTAClarity();
    this.checkContrast();
    this.checkTapTargets();
    this.checkDensity();
    this.checkPerformanceMetrics();
    this.checkLayoutShift();
    this.checkForms();
    this.checkPsychologyPatterns();
    this.checkMobileResponsiveness();
    this.checkMedia();

    return this.issues;
  }

  getLayoutSummary() {
    const title = document.title;
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(Boolean);
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const sections = Array.from(document.querySelectorAll('section, main, header, footer, nav')).map(el => {
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className ? `.${el.className.split(' ').join('.')}` : '';
      return `${el.tagName}${id}${cls}`;
    });

    return {
      title,
      h1s,
      metaDesc,
      structure: sections.slice(0, 15),
      stats: {
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length,
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length
      }
    };
  }

  getDeepPageSnapshot() {
    const snapshot = {
      layout: this.getLayoutSummary(),
      elements: []
    };

    // 1. Extract CTAs and Interactive elements
    const interactives = document.querySelectorAll('button, a[href], [role=button]');
    interactives.forEach((el, i) => {
      const ufdId = `btn-${i}`;
      el.setAttribute('data-ufd-id', ufdId);
      const ctx = this.getElementContext(el);
      snapshot.elements.push({
        ufdId,
        type: 'cta',
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: Array.from(el.classList).join(' '),
        text: (el.innerText || el.value || '').trim().slice(0, 50),
        context: ctx.label,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        dims: `${el.offsetWidth}x${el.offsetHeight}`
      });
    });

    // 2. Extract Images & Media
    const images = document.querySelectorAll('img');
    images.forEach((img, i) => {
      const ufdId = `img-${i}`;
      img.setAttribute('data-ufd-id', ufdId);
      snapshot.elements.push({
        ufdId,
        type: 'image',
        id: img.id || null,
        classes: Array.from(img.classList).join(' '),
        src: img.src.split('/').pop().slice(0, 30),
        alt: img.alt || null,
        dims: `${img.naturalWidth}x${img.naturalHeight}`,
        aspectRatioMissing: !img.getAttribute('width') || !img.getAttribute('height')
      });
    });

    // 3. Extract Forms
    const forms = document.querySelectorAll('form');
    forms.forEach((form, i) => {
      const ufdId = `form-${i}`;
      form.setAttribute('data-ufd-id', ufdId);
      const inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
      snapshot.elements.push({
        ufdId,
        type: 'form',
        id: form.id || null,
        classes: Array.from(form.classList).join(' '),
        fieldCount: inputs.length,
        hasLabels: Array.from(inputs).every(input => {
          const id = input.id;
          return id ? !!document.querySelector(`label[for="${id}"]`) : !!input.closest('label');
        })
      });
    });

    // 4. Performance Snapshot
    snapshot.performance = {
      cls: this.stats.layoutShiftScore,
      fid: this.stats.firstInputDelay,
      ttfb: performance.getEntriesByType("navigation")[0]?.responseStart || 0
    };

    return snapshot;
  }

  addIssue(id, category, severity, element, problem, suggestion, score_impact, meta = {}) {
    // Cap same-type issues at 3 — then aggregate
    const sameType = this.issues.filter(i => i.id === id);
    if (sameType.length >= 3) {
      // Update the last item to be a summary if it isn't already
      const last = sameType[sameType.length - 1];
      if (!last._isGroupSummary) {
        last._isGroupSummary = true;
        last.problem = `${sameType.length} instances of: "${last._baseMsg}" and more…`;
        last.element = null;
        this.elementMap.delete(last.index);
      } else {
        const count = sameType.length + 1;
        last.problem = `${count} instances of: "${last._baseMsg}" across page`;
      }
      return; // Don't add a new card
    }

    const issueId = this.issues.length;
    if (element) {
      this.elementMap.set(issueId, element);
    }
    this.issues.push({
      id,
      index: issueId,
      category,
      severity,
      problem,
      _baseMsg: problem, // keep original for grouping
      suggestion,
      score_impact,
      meta
    });
  }

  // 1. CTA Clarity Check
  //    "Read More" / "Learn More" are fine on blog cards — only flag on hero/primary areas.
  //    "Click Here", "Go", "OK" are always vague regardless of context.
  checkCTAClarity() {
    // Always wrong — no context makes these good CTAs
    const alwaysVague = ["click here", "click", "go", "ok"];
    // Only vague where they're meant to be a primary CTA
    const contextVague = ["submit", "learn more", "read more"];
    const elements = document.querySelectorAll('button, a[href], input[type=submit]');
    
    elements.forEach(el => {
      const ctx = this.getElementContext(el);

      // Navigation and footer links are intentionally short/generic — skip them
      if (ctx.inNav || ctx.inFooter) return;

      // Skip completely empty or icon-only elements
      if (this.isIconOnly(el)) return;

      const rawText = (el.innerText || el.value || '').trim();
      if (!rawText) return;
      const text = rawText.toLowerCase();
      const preview = rawText.length > 35 ? rawText.slice(0, 35) + '…' : rawText;

      const isAlwaysVague = alwaysVague.includes(text);
      // "Read More" / "Learn More" / "Submit" are acceptable on cards and in article lists
      // Only flag them if they appear in a hero, modal, or standalone body position
      const isContextVague = contextVague.includes(text) && !ctx.inCard;

      if (isAlwaysVague || isContextVague) {
        // Build a smarter suggestion based on what the CTA is and where it lives
        let suggestion;
        if (text === 'read more' || text === 'learn more') {
          suggestion = `[${ctx.label}] "${preview}" on a primary section should be specific. What will they read about? Use "Explore ${ctx.label === 'Hero' ? 'Our Solution' : 'This Topic'}" or "See Case Study". A named CTA tells the user what they'll get, not just that more exists.`;
        } else if (text === 'submit') {
          suggestion = `Replace "Submit" with the outcome: "Send My Message", "Get Free Quote", "Create Account". The submit button is your last persuasion point — make it earn the click.`;
        } else {
          suggestion = `"${preview}" gives users no information. Complete the sentence: "I want to ___". The CTA should name the benefit or action ("Start Free Trial", "Download PDF", "Book a Call").`;
        }
        this.addIssue('vagueCTA', 'usability', 'warning', el,
          `[${ctx.label}] Vague CTA: "${preview}"`,
          suggestion,
          5, { text });
      } else if (text.split(/\s+/).length > 5 && ctx.inHero) {
        // Only flag verbose CTAs if they're in a high-visibility hero/action area
        this.addIssue('verboseCTA', 'usability', 'info', el,
          `[${ctx.label}] CTA too long: "${preview}"`,
          `Shorten to 2–4 words. Edit: "${rawText}" → pick the strongest verb + 1–2 nouns. Put extra context in sub-copy below the button instead.`,
          2);
      }
    });
  }

  // 2. Color Contrast
  //    Skips decorative/icon text and empty elements. Flags only where readability matters.
  checkContrast() {
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, li, a, td, th');
    const processedElements = new Set();

    textElements.forEach(el => {
      const text = el.innerText.trim();
      if (text.length === 0) return;
      // Skip icon-only elements (single emoji/char) — contrast is irrelevant
      if (text.length <= 2 && /^[\W\d]+$/.test(text)) return;

      // Parent already flagged — skip to avoid duplicates
      let parent = el.parentElement;
      while (parent) {
        if (processedElements.has(parent)) return;
        parent = parent.parentElement;
      }

      const ctx = this.getElementContext(el);
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = this.getElementBackground(el);

      if (color && bgColor) {
        try {
          const ratio = calculateContrastRatio(color, bgColor);
          const fontSize = parseFloat(style.fontSize);
          const weight = style.fontWeight;
          const isLarge = fontSize >= 18 || (fontSize >= 14 && (weight === 'bold' || parseInt(weight) >= 700));
          const threshold = isLarge ? 3 : 4.5;

          if (ratio < threshold) {
            const preview = text.slice(0, 28);
            this.addIssue('contrast', 'accessibility', 'critical', el,
              `[${ctx.label}] Contrast ${ratio.toFixed(2)}:1 on "${preview}"`,
              `WCAG AA requires ${threshold}:1 here. In DevTools: inspect this element, check color: and background-color:. Change the text color to at least #${ratio < 2 ? '555' : '666'} on white, or use a darker background behind it. Tool: webaim.org/resources/contrastchecker`,
              8);
            processedElements.add(el);
          }
        } catch (e) {}
      }
    });
  }

  // Context helper — where does this element live?
  getElementContext(el) {
    const inNav    = !!el.closest('nav, [role=navigation], header');
    const inFooter = !!el.closest('footer, [role=contentinfo]');
    const inHero   = !!el.closest('[class*=hero], [class*=banner], [class*=jumbotron], [id*=hero]');
    const inModal  = !!el.closest('[role=dialog], .modal, [class*=modal], [class*=popup]');
    const inForm   = !!el.closest('form');
    const inCard   = !!el.closest('[class*=card], [class*=item], [class*=tile], article');
    const inSidebar= !!el.closest('aside, [class*=sidebar]');

    const label = inNav ? 'Navbar'
      : inFooter  ? 'Footer'
      : inHero    ? 'Hero'
      : inModal   ? 'Modal'
      : inForm    ? 'Form'
      : inCard    ? 'Card'
      : inSidebar ? 'Sidebar'
      : 'Page body';

    return { inNav, inFooter, inHero, inModal, inForm, inCard, inSidebar, label };
  }

  // Is this element primarily icon-only (no meaningful text)?
  isIconOnly(el) {
    const text = (el.innerText || '').trim();
    const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('title');
    const singleChar   = text.length <= 2; // emoji, «, ×, etc.
    const looksLikeIcon= /^[\W\d]{0,2}$/.test(text) || text === '';
    return looksLikeIcon || (singleChar && hasAriaLabel);
  }

  getElementBackground(el) {
    let current = el;
    while (current) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'initial') return bg;
      current = current.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }

  // 3. Tap Targets
  //    Skips: nav/footer icon links (intentional design), elements outside viewport.
  //    Only flags genuinely interactive elements with no detectable intent to be small.
  checkTapTargets() {
    const interactives = document.querySelectorAll('button, a[href], input, [role=button]');
    interactives.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Must be visible and have actual dimensions
      if (rect.width <= 0 || rect.height <= 0) return;
      // Already big enough
      if (rect.width >= 44 && rect.height >= 44) return;

      const ctx = this.getElementContext(el);

      // Footer links: intentionally small — skip
      if (ctx.inFooter) return;

      // Nav icon buttons with an aria-label: designer made them intentionally small — skip
      if (ctx.inNav && this.isIconOnly(el) && el.hasAttribute('aria-label')) return;

      // Breadcrumb separators and similar decorative links — skip
      if (this.isIconOnly(el) && !el.hasAttribute('aria-label') && !el.innerText.trim()) return;

      const label = (
        el.innerText ||
        el.value ||
        el.getAttribute('aria-label') ||
        el.tagName
      ).trim().slice(0, 24);

      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      const missing = w < 44 && h < 44 ? 'width and height'
                    : w < 44 ? 'width'
                    : 'height';

      this.addIssue('buttonSize', 'usability', 'warning', el,
        `[${ctx.label}] "${label}" tap target too small (${w}×${h}px)`,
        `Minimum is 44×44px (Apple HIG). This element's ${missing} is too small for reliable touch. Fix: add padding: 12px 16px or use min-height: 44px; min-width: 44px in CSS. If the visual size must stay small (e.g. icon button), wrap it and add padding to the wrapper instead.`,
        5);
    });
  }

  // 4. Density
  checkDensity() {
    const count = this.stats.interactiveCount;
    if (count > 35) {
      this.addIssue('density', 'psychology', 'critical', null, 
        `High cognitive load (${count} interactive elements).`, 
        `Hick's Law: decision time grows logarithmically with choices. ${count} options is overwhelming. Audit your elements — categorize into Primary (1–2 main CTAs), Secondary (navigation, utility), and Tertiary (links, meta). Remove or collapse everything tertiary. Above-the-fold should have exactly 1 primary CTA. Use progressive disclosure: hide advanced actions behind a "More options" dropdown. Target: max 5–7 primary interactions per screen.`,
        10, { count });
    } else if (count > 20) {
      this.addIssue('density', 'psychology', 'warning', null, 
        `Moderate cognitive load (${count} interactive elements).`, 
        `${count} interactive elements is approaching the cognitive limit (Miller's Law: 7±2). Group related actions into logical clusters. Use visual hierarchy — make 1 button clearly primary with a filled style, others ghost or text-only. Consider if any links or buttons can be merged or removed.`,
        5, { count });
    }
  }

  // 5. Performance (FID & TTFB)
  checkPerformanceMetrics() {
    if (this.stats.firstInputDelay > 300) {
      this.addIssue('performance', 'performance', 'critical', null, 
        `High interaction delay (${Math.round(this.stats.firstInputDelay)}ms).`, 
        `FID of ${Math.round(this.stats.firstInputDelay)}ms is critical (Google threshold: 100ms). Open Chrome DevTools → Performance tab → record page load → look for "Long Tasks" (red bars). Common culprits: large JS bundles blocking the main thread, synchronous localStorage reads, heavy third-party scripts (chat, analytics). Fix: code-split with dynamic import(), defer non-critical scripts with defer or async, move analytics to Web Workers.`,
        10);
    } else if (this.stats.firstInputDelay > 100) {
      this.addIssue('performance', 'performance', 'warning', null, 
        `Interaction delay noticed (${Math.round(this.stats.firstInputDelay)}ms).`, 
        `FID of ${Math.round(this.stats.firstInputDelay)}ms is above the 100ms "feels instant" threshold. Profile with DevTools → Coverage tab to find unused JS. Add loading="lazy" to off-screen images. Preconnect to critical third-party origins: <link rel="preconnect" href="https://fonts.googleapis.com">.`,
        5);
    }

    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.responseStart - nav.startTime > 800) {
       this.addIssue('performance', 'performance', 'warning', null, 
        "Slow server response (TTFB).", 
        `TTFB of ${Math.round(nav.responseStart - nav.startTime)}ms is too slow (target: <200ms). Fix options: (1) Enable server-side caching (Redis, Varnish), (2) Add a CDN (Cloudflare, Fastly) to serve assets from edge nodes, (3) Upgrade your hosting tier, (4) Enable HTTP/2 on your server, (5) Use static site generation (Next.js SSG, Astro) for content-heavy pages.`,
        5);
    }
  }

  // 6. Layout Shift
  checkLayoutShift() {
    const cls = this.stats.layoutShiftScore;
    if (cls > 0.25) {
      this.addIssue('layoutShift', 'performance', 'critical', null, 
        `Poor layout stability (CLS: ${cls.toFixed(3)}).`, 
        `CLS of ${cls.toFixed(3)} is poor (Google Core Web Vital threshold: <0.1). Main causes: (1) Images without width/height attributes — always set these, (2) Ads without reserved space — wrap in a fixed-height container, (3) Late-injected content above existing content — use skeleton screens, (4) Web fonts causing FOUT — use font-display: optional or preload critical fonts. Debug with: new PerformanceObserver(l => l.getEntries().forEach(e => e.sources.forEach(s => console.log(s.node)))).observe({type:'layout-shift', buffered:true})`,
        10);
    } else if (cls > 0.1) {
      this.addIssue('layoutShift', 'performance', 'warning', null, 
        `Moderate layout shifts (CLS: ${cls.toFixed(3)}).`, 
        `CLS of ${cls.toFixed(3)} needs improvement (target: <0.1). Quick wins: Add explicit height to image containers (aspect-ratio: 16/9 in CSS), reserve space for banner ads, and add font-display: swap to your @font-face declarations to prevent invisible text during load.`,
        5);
    }
  }

  // 7. Forms
  checkForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
      if (inputs.length > 7) {
        this.addIssue('formLength', 'psychology', 'warning', form, 
          `Form is too long (${inputs.length} fields).`, 
          `Forms with 3 fields convert at ~25%, 7+ fields drop below 10% (Formstack data). Remove optional fields or move them to step 2 after initial submit. Split into a multi-step form — progress bars increase completion by 28%. Consider: can phone, company, or secondary email be skipped? Use smart defaults wherever possible. Only ask for information you need right now.`,
          5, { count: inputs.length });
      }

      inputs.forEach(input => {
        const id = input.id;
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : input.closest('label');
        if (!hasLabel && input.type !== 'submit' && input.type !== 'button') {
          const name = input.name || input.placeholder || input.type || '?';
          this.addIssue('formUX', 'accessibility', 'warning', input, 
            `Input "${name}" has no visible label.`, 
            `A visible <label> is required for WCAG 2.1 SC 1.3.1. Fix: <label for="${input.id || 'yourInputId'}">Field Name</label>. Placeholders are NOT labels — they disappear on focus and have low contrast. Never use placeholder as the only label. If space is tight, use floating labels (CSS-only pattern): position label above input on focus using :focus-within + translate transform.`,
            5);
        }
      });
    });
  }

  // 8. Psychology
  checkPsychologyPatterns() {
    // Too many popups/overlays
    const fixedOverlays = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' && parseInt(style.zIndex) > 100;
    });

    if (fixedOverlays.length > 2) {
      this.addIssue('density', 'psychology', 'warning', null, 
        `Too many fixed overlays (${fixedOverlays.length} detected).`, 
        `Multiple simultaneous modals/overlays create extreme cognitive anxiety. Only one modal should be visible at a time. Use a modal stack manager — store open modals in an array, push/pop on open/close, and never show more than index 0. Add overlay.addEventListener('click', closeModal) for easy dismissal. Always provide a visible × button with min 24×24px target. Trap focus inside the modal for keyboard accessibility.`,
        5);
    }

    // Infinite Scroll detection dummy check (often involves mutation observers but we check simple height growth)
    // Here we can just flag if MutationObserver was triggered too much during audit, 
    // but for static audit we check if body is unusually tall without sections
    if (document.body.scrollHeight > window.innerHeight * 10) {
       this.addIssue('infiniteScroll', 'psychology', 'info', null, 
        "Infinite scroll detected.", 
        `Infinite scroll is great for content browsing (feeds, galleries) but terrible for task completion (e-commerce, search results). Users lose their place and can't bookmark a position. Fix: show a "Load more" button after every 10–20 items, and restore scroll position on browser back. If keeping infinite scroll, add a sticky position indicator ("Showing 1–40 of 200") so users feel a sense of progress.`,
        2);
    }
  }

  // 9. Mobile
  checkMobileResponsiveness() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      this.addIssue('mobile', 'design', 'critical', null, 
        "Viewport meta tag missing.", 
        `Without a viewport meta tag, mobile browsers render the page at desktop width (~980px) then scale it down — making text unreadably small. Fix: add <meta name="viewport" content="width=device-width, initial-scale=1"> in your <head>. This is step 1 of any responsive design. After adding it, test with Chrome DevTools Device Toolbar (Ctrl+Shift+M).`,
        8);
    }

    const bodyWidth = document.body.clientWidth;
    const overflowers = Array.from(document.querySelectorAll('*')).filter(el => {
       const rect = el.getBoundingClientRect();
       return rect.right > bodyWidth + 5; // buffer
    });

    if (overflowers.length > 0) {
      this.addIssue('mobileOverflow', 'design', 'warning', overflowers[0], 
        "Elements overflow the viewport width.", 
        `Horizontal scroll on mobile is a UX death sentence — most users will leave immediately. Debug: in Chrome DevTools, enable device emulation, open Elements panel, and hover over elements to find which one exceeds 100vw. Common causes: fixed-width elements (width: 800px instead of max-width: 100%), non-responsive images (add max-width: 100%; height: auto;), and overflowing tables (wrap in overflow-x: auto container). Use * { box-sizing: border-box } globally.`,
        5);
    }

    const smallText = Array.from(document.querySelectorAll('p, span, div')).filter(el => {
      const size = parseFloat(window.getComputedStyle(el).fontSize);
      return size > 0 && size < 12 && el.innerText.trim().length > 0;
    });

    if (smallText.length > 0) {
      const size = parseFloat(window.getComputedStyle(smallText[0]).fontSize);
      this.addIssue('tooSmallFont', 'usability', 'info', smallText[0], 
        `Text too small (${size}px) — ${smallText.length} element(s) affected.`, 
        `${size}px is below the 12px accessibility minimum. iOS zooms in automatically on inputs < 16px — this causes layout bugs. Fix: set base font to 16px on html { font-size: 16px } and use rem for all type. The recommended minimum for body copy is 16px, captions/labels minimum 12px. Use a type scale (e.g. 1.25 ratio): 12 / 15 / 19 / 24 / 30px. Never use px for font sizes in media queries — use em instead.`,
        3);
    }
  }

  // 10. Media
  checkMedia() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = (img.src || '').split('/').pop().slice(0, 20) || 'img';
      if (!img.alt && img.alt !== '') {
        this.addIssue('altMissing', 'accessibility', 'warning', img, 
          `Missing alt text on "${src}"`, 
          `Required by WCAG 2.1 SC 1.1.1. For informative images: describe what the image shows, not what it is. "Two developers pair programming at a standing desk" not "developers.jpg" or "image". For decorative images: alt="" (empty string, not missing). For icons: use aria-label on the parent button instead. For product images: include key attributes — color, style, what the user can't tell from the product name alone.`,
          5);
      }
      if (!img.getAttribute('width') || !img.getAttribute('height')) {
        this.addIssue('mediaSize', 'performance', 'info', img, 
          `No dimensions on "${src}" — may cause layout shift.`, 
          `Add width and height HTML attributes matching the image's natural dimensions. The browser uses this ratio to reserve space before the image loads, eliminating layout shift. Example: <img src="hero.jpg" width="1200" height="630" loading="lazy" alt="...">. Modern CSS resets include img { max-width: 100%; height: auto } so the image will still be responsive. Use aspect-ratio: 16/9 in CSS as a fallback.`,
          2);
      }
    });
  }
}

// Global instance
const detector = new FrictionDetector();

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runAudit") {
    detector.runAudit().then(issues => {
      if (window.ufdOverlay) window.ufdOverlay.clearHighlights();
      sendResponse({ issues });
    });
    return true;
  }

  if (request.action === "getLayoutSummary") {
    sendResponse(detector.getLayoutSummary());
    return false;
  }

  if (request.action === "getDeepPageSnapshot") {
    sendResponse(detector.getDeepPageSnapshot());
    return false;
  }
  
  if (request.action === "highlightIssue") {
    console.log("UFD: Highlight requested", request);
    if (window.ufdOverlay) {
      let element = null;
      if (request.ufdId && request.ufdId !== "null") {
        element = document.querySelector(`[data-ufd-id="${request.ufdId}"]`);
      } else if (request.index !== undefined) {
        element = detector.elementMap.get(request.index);
      }

      console.log("UFD: Found element", element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.ufdOverlay.highlightElement(element, request.severity, request.problem, request.suggestion);
      }
    }
  }
  
  if (request.action === "clearHighlights") {
    if (window.ufdOverlay) window.ufdOverlay.clearHighlights();
  }
});

console.log("UFD Content Script Loaded");