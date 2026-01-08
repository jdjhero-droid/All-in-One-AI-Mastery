
/**
 * Simple client-side encryption utility for API Key storage.
 * In a real-world scenario, a more robust solution would be used.
 */

const STORAGE_KEY = 'wt_ai_mastery_managed_key';
const SALT = 'wild_teacher_vault_2024';

const xorCipher = (text: string): string => {
  return text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
  ).join('');
};

export const saveApiKey = (key: string): void => {
  try {
    const encrypted = btoa(xorCipher(key));
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error('Failed to save API key', e);
  }
};

export const getApiKey = (): string | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return xorCipher(atob(stored));
  } catch (e) {
    console.error('Failed to retrieve API key', e);
    return null;
  }
};

export const removeApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};
