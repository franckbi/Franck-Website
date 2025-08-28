# Theme and Settings Infrastructure

This directory contains the theme and settings infrastructure for the 3D portfolio website.

## Components

### Theme Context (`contexts/theme-context.tsx`)

Provides theme management with React Context:

- **Theme modes**: `light`, `dark`, `system`
- **System preference detection**: Automatically detects and follows system color scheme
- **Persistence**: Stores theme preference in localStorage
- **Dynamic updates**: Listens for system theme changes

Usage:

```tsx
import { ThemeProvider, useTheme } from '@/lib/contexts/theme-context';

// Wrap your app
<ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
  <App />
</ThemeProvider>;

// Use in components
const { theme, resolvedTheme, setTheme } = useTheme();
```

### Settings Store (`stores/settings-store.ts`)

Global state management with Zustand:

- **Low power mode**: Disables 3D rendering for performance
- **Reduced motion**: Respects user's motion preferences
- **Performance mode**: Adaptive quality settings
- **System detection**: Automatically detects connection speed and motion preferences

Usage:

```tsx
import { useSettingsStore } from '@/lib/stores/settings-store';

const { lowPowerMode, toggleLowPowerMode } = useSettingsStore();
```

## UI Components

### ThemeToggle (`components/ui/theme-toggle.tsx`)

Interactive theme switcher:

- **Button variant**: Cycles through themes on click
- **Dropdown variant**: Select theme from dropdown
- **Accessibility**: Full keyboard navigation and screen reader support

### LowPowerToggle (`components/ui/low-power-toggle.tsx`)

Performance mode toggle:

- **Visual indicators**: Battery icons for power state
- **Optional labels**: Show current power mode
- **Accessibility**: ARIA labels and keyboard support

### SettingsPanel (`components/ui/settings-panel.tsx`)

Combined settings interface:

- **Compact variant**: Icon-only toggles
- **Expanded variant**: Full settings panel with labels
- **Status display**: Shows current theme and performance settings

## Features

### System Integration

- **Color scheme detection**: `prefers-color-scheme` media query
- **Motion preferences**: `prefers-reduced-motion` media query
- **Connection awareness**: Network Information API for performance hints
- **Battery awareness**: Connection speed detection for low power mode

### Persistence

- **Theme preference**: Stored in localStorage with configurable key
- **Settings state**: Zustand persistence middleware
- **Hydration safe**: Prevents flash of incorrect theme

### Performance

- **Lazy loading**: Components load only when needed
- **Minimal bundle**: Tree-shakeable exports
- **Memory efficient**: Proper cleanup and event listener management

## Testing

All components include comprehensive unit tests:

- **Theme context**: Theme switching, persistence, system preferences
- **Settings store**: State management, system detection
- **UI components**: Interactions, accessibility, visual states

Run tests:

```bash
npm run test
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **7.1**: Theme toggle with light/dark mode and system preference detection
- **7.2**: Low-Power toggle with localStorage persistence
- **7.3**: Settings stored in localStorage for future visits
- **7.4**: System preferences respected for color scheme and reduced motion
