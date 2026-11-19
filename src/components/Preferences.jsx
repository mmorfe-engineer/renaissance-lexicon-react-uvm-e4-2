/**
 * Preferences component
 * Theme and typography settings
 * Ported from 4.1 compact design
 */
import { useState, useEffect, useCallback } from 'react';

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

const FONT_OPTIONS = {
  [FONTS.EDITORIAL]: 'Editorial · Noto Serif',
  [FONTS.CLASSIC]: 'Clásica · Liberation',
  [FONTS.SANS]: 'Moderna · Noto Sans',
  [FONTS.HUMANIST]: 'Humanista · DejaVu',
  [FONTS.MONO]: 'Código · DejaVu Mono'
};

const THEME_OPTIONS = {
  [THEMES.SYSTEM]: 'Sistema',
  [THEMES.LIGHT]: 'Claro',
  [THEMES.DARK]: 'Oscuro'
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
  
  if (theme === THEMES.DARK) {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === THEMES.LIGHT) {
    html.setAttribute('data-theme', 'light');
  } else {
    // System
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

/**
 * Apply font to document
 */
function applyFont(font) {
  document.body.setAttribute('data-font', font);
}

/**
 * Watch for system theme changes
 */
function setupThemeWatcher() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = () => {
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

  const handleThemeChange = useCallback((e) => {
    setPrefs(prev => ({ ...prev, theme: e.target.value }));
  }, []);

  const handleFontChange = useCallback((e) => {
    setPrefs(prev => ({ ...prev, font: e.target.value }));
  }, []);

  return (
    <div className="preference-controls">
      <div className="preference">
        <label htmlFor="font">Tipografía</label>
        <select
          id="font"
          value={prefs.font}
          onChange={handleFontChange}
          aria-label="Seleccionar tipografía"
        >
          {Object.entries(FONT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="preference">
        <label htmlFor="theme">Tema</label>
        <select
          id="theme"
          value={prefs.theme}
          onChange={handleThemeChange}
          aria-label="Seleccionar tema"
        >
          {Object.entries(THEME_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Preferences;
