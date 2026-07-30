const SESSION_KEY = 'emerald-hyperspace-shown';

/** Play the arrival sequence once per session, never against motion prefs. */
export function shouldPlayIntro(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return !sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* storage unavailable — the sequence simply replays next load */
  }
}
