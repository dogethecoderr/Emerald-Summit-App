import { useCallback, useRef, useState } from 'react';

/** Snackbar-style transient message, mirroring ScaffoldMessenger.showSnackBar. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  const toast = message ? <div className="toast">{message}</div> : null;

  return { toast, showToast };
}
