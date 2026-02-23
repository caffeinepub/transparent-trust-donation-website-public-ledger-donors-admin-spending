import { useState, useEffect } from 'react';

/**
 * A hook that syncs state with localStorage
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorageState(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<string>(() => {
    // Check if localStorage is available (SSR guard)
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever the state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, storedValue);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
