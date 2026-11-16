# Arquitectura - Renaissance Lexicon · React Edition

## Descripción

Evolución académica de Renaissance Lexicon (E-Actividad 4.1) implementada con React y programación reactiva.

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| Framework | React 18+ | Renderizado declarativo |
| Build Tool | Vite 5+ | Bundling y desarrollo |
| Lenguaje | JavaScript (ES2020+) | Lógica de aplicación |
| Estilos | CSS personalizado | Diseño visual |
| API Externa | Dictionary API | Búsqueda de definiciones |
| Persistencia | localStorage | Almacenamiento local |
| Despliegue | GitHub Pages | Hosting público |

## Estructura de Archivos

```
renaissance-lexicon-react-uvm-e4-2/
├── docs/
│   ├── PLIEGO_4_2.md
│   ├── ARQUITECTURA.md
│   └── CUMPLIMIENTO_PLIEGO.md
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SearchForm.jsx
│   │   ├── DictionaryResult.jsx
│   │   ├── PronunciationControl.jsx
│   │   ├── LexiconList.jsx
│   │   ├── LexiconCard.jsx
│   │   ├── EntryEditor.jsx
│   │   ├── Preferences.jsx
│   │   └── StatusMessage.jsx
│   ├── hooks/
│   │   ├── useDictionary.js
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   ├── reducers/
│   │   └── lexiconReducer.js
│   ├── services/
│   │   └── dictionaryApi.js
│   ├── utils/
│   │   └── validation.js
│   └── styles/
│       └── styles.css
├── vite.config.js
├── package.json
└── README.md
```

## Patrón de Estado

- **Gestión:** `useReducer` para el léxico
- **Acciones:** CREATE_ENTRY, UPDATE_ENTRY, DELETE_ENTRY, HYDRATE_ENTRIES
- **Persistencia:** localStorage (fuera del reducer)

## Entidad Principal: Mi Léxico

```javascript
{
  id: string,           // UUID v4
  word: string,         // Palabra principal
  phonetic: string,     // Fonética (opcional)
  partOfSpeech: string, // Categoría gramatical
  definition: string,   // Definición de Dictionary API
  sourceUrl: string,    // Fuente original
  notes: string,        // Notas personales
  learningStatus: 'Nueva' | 'Aprendiendo' | 'Dominada',
  createdAt: number,    // Timestamp
  updatedAt: number     // Timestamp
}
```

## Flujo de Datos

```
Evento (UI) → Acción → Reducer → Estado → Re-render → DOM
                  ↓
            (Efectos: API, localStorage)
```

## Requisitos No Funcionales

- **Responsive:** Adaptable a móviles, tablets y desktop
- **Accesibilidad:** Cumplimiento WCAG 2.1 AA
- **Rendimiento:** < 2s tiempo de carga inicial
- **Compatibilidad:** Chrome, Firefox, Edge (últimas 2 versiones)

## Continuidad con 4.1

- Identidad visual preservada
- Diseño editorial consistente
- Tema claro/oscuro
- Preferencia del sistema
- Cinco tipografías
- Búsqueda con debounce
- Validación y manejo de errores
- Fonética y pronunciación
- Accesibilidad y responsive

## Restricciones

- **NO** TypeScript (a menos que el profesor lo requiera)
- **NO** Redux, Zustand u otros stores externos
- **NO** Tailwind, Bootstrap, Material UI
- **NO** Firebase, Supabase o backends
- **NO** Autenticación
- **NO** Manipulación directa del DOM (solo React gobierna el renderizado)
