/**
 * Utility to dynamically load Google Fonts or Custom Fonts at runtime.
 */
export function loadGoogleFont(fontFamily?: string): void {
  if (!fontFamily || typeof document === 'undefined') return;

  // Extract clean font name (remove quotes, fallbacks, etc.)
  const clean = fontFamily.trim().replace(/['"]/g, '').split(',')[0].trim();
  if (!clean || ['serif', 'sans-serif', 'cursive', 'monospace', 'fantasy', 'inherit', 'initial', 'unset'].includes(clean.toLowerCase())) {
    return;
  }

  const fontId = 'gf-dyn-' + clean.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (document.getElementById(fontId)) {
    return;
  }

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean.replace(/ /g, '+'))}&display=swap`;
  document.head.appendChild(link);
}
