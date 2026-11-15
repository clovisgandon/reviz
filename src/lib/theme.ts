import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
const KEY = 'reviz.theme';

/** Petit réglage d'affichage : stocké en localStorage (lu avant le rendu dans index.html). */
export function getThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', dark ? '#0c121b' : '#1f4e79');
}

export function useThemeMode(): [ThemeMode, (m: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(getThemeMode);
  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* navigation privée : on ignore */
    }
    if (mode !== 'auto') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => applyTheme('auto');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mode]);
  return [mode, setMode];
}
