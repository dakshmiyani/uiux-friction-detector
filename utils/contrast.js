/**
 * WCAG 2.1 Contrast Ratio Calculator
 */

function getRelativeLuminance(color) {
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Export for content script or use as global if injected
if (typeof module !== 'undefined') {
  module.exports = { calculateContrastRatio };
}
