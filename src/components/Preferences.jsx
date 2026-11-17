/**
 * Preferences component
 * Theme and typography settings
 */
import { useState, useEffect } from 'react';

const THEMES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
};

const FONTS = {
  EDITORIAL: 'editorial',
  CLASSIC: 'classic',
  SANS: 'sans',
  HUMANIST: 'humanist',
  MONO: 'mono'
};

const FONT_LABELS = {
  [FONTS.EDITORIAL]: 'Editorial',
  [FONTS.CLASSIC]: 'Clasica',
  [FONTS.SANS]: 'Sans',
  [FONTS.HUMANIST]: 'Humanista',
  [FONTS.MONO]: 'Mono'
};

const PREFERENCES_KEY = 'renaissance-lexicon-react-preferences';

/**
 * Load preferences from localStorage
 */
function loadPreferences() {
  try {
    const saved = window.localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return { theme: THEMES.SYSTEM, font: FONTS.EDITORIAL };
}

/**
 * Save preferences to localStorage
 */
function savePreferences(prefs) {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore errors
  }
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  const html = document.documentElement;
  
  // Apply theme via data attribute
  if (theme === THEMES.DARK) {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === THEMES.LIGHT) {
    html.setAttribute('data-theme', 'light');
  } else {
    // System - check prefers-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

/**
 * Apply font to document
 */
function applyFont(font) {
  const body = document.body;
  body.setAttribute('data-font', font);
}

/**
 * Watch for system theme changes
 */
function setupThemeWatcher() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e) => {
    const prefs = loadPreferences();
    if (prefs.theme === THEMES.SYSTEM) {
      applyTheme(THEMES.SYSTEM);
    }
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

export function Preferences() {
  const [prefs, setPrefs] = useState(() => loadPreferences());

  // Apply theme and font on mount and when prefs change
  useEffect(() => {
    applyTheme(prefs.theme);
    applyFont(prefs.font);
  }, [prefs.theme, prefs.font]);

  // Setup system theme watcher
  useEffect(() => {
    return setupThemeWatcher();
  }, []);

  // Save prefs when they change
  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const handleThemeChange = (theme) => {
    setPrefs(prev => ({ ...prev, theme }));
  };

  const handleFontChange = (font) => {
    setPrefs(prev => ({ ...prev, font }));
  };

  return (
    <section className="preferences" aria-labelledby="preferences-heading">
      <h3 id="preferences-heading">Preferencias</h3>
      
      <div className="preference-group">
        <label htmlFor="theme-select">Tema:</label>
        <select
          id="theme-select"
          value={prefs.theme}
          onChange={(e) => handleThemeChange(e.target.value)}
          aria-label="Seleccionar tema"
        >
          <option value={THEMES.SYSTEM}>Sistema</option>
          <option value={THEMES.LIGHT}>Claro</option>
          <option value={THEMES.DARK}>Oscuro</option>
        </select>
      </div>
      
      <div className="preference-group">
        <label htmlFor="font-select">Tipografia:</label>
        <select
          id="font-select"
          value={prefs.font}
          onChange={(e) => handleFontChange(e.target.value)}
          aria-label="Seleccionar tipografia"
        >
          <option value={FONTS.EDITORIAL}>{FONT_LABELS[FONTS.EDITORIAL]}</option>
          <option value={FONTS.CLASSIC}>{FONT_LABELS[FONTS.CLASSIC]}</option>
          <option value={FONTS.SANS}>{FONT_LABELS[FONTS.SANS]}</option>
          <option value={FONTS.HUMANIST}>{FONT_LABELS[FONTS.HUMANIST]}</option>
          <option value={FONTS.MONO}>{FONT_LABELS[FONTS.MONO]}</option>
        </select>
      </div>
      
      <div className="preference-info">
        <p>
          <small>
            El tema "Sistema" usa la preferencia de tu sistema operativo.\n            "Claro" y "Oscuro" fuerzan ese modo especificamente.
          </small>
        </p>
      </div>
    </section>
  );
}

export default Preferences;
