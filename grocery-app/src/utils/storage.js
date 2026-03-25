// localStorage helper with JSON serialization
const PREFIX = 'feira_';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}
