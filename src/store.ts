import { StoreOptions, StoredValue } from "./types";
import { encrypt, decrypt } from "./crypto";

// Create a memory store for SSR/Node.js environments
const createMemoryStorage = () => {
  const memoryStore = new Map<string, string>();
  return {
    getItem: (key: string) => memoryStore.get(key) || null,
    setItem: (key: string, val: string) => memoryStore.set(key, val),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
    key: (i: number) => Array.from(memoryStore.keys())[i],
    get length() {
      return memoryStore.size;
    },
  } as Storage;
};

export const createStore = (namespace: string, options: StoreOptions = {}) => {
  // Try to access window storage, fall back to memory storage if not available
  let storage: Storage;
  try {
    storage = options.storage === "session" 
      ? window.sessionStorage 
      : window.localStorage;
  } catch {
    storage = createMemoryStorage();
  }

  const prefix = `${namespace}::`;

  const set = (key: string, value: any, ttlSeconds?: number) => {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    let raw = JSON.stringify({ value, expiry });

    if (options.encrypt && options.secret) {
      raw = encrypt(raw, options.secret);
    }

    storage.setItem(prefix + key, raw);
  };

  const get = (key: string) => {
    const raw = storage.getItem(prefix + key);
    if (!raw) return null;

    let parsed: StoredValue;
    try {
      const decrypted =
        options.encrypt && options.secret ? decrypt(raw, options.secret) : raw;
      parsed = JSON.parse(decrypted);
    } catch {
      return null;
    }

    if (parsed.expiry && Date.now() > parsed.expiry) {
      remove(key);
      return null;
    }

    return parsed.value;
  };

  const remove = (key: string) => {
    storage.removeItem(prefix + key);
  };

  const clear = () => {
    // Get all keys first to avoid issues with index shifting during removal
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    // Remove all matching keys
    keys.forEach(key => storage.removeItem(key));
  };

  return {
    set,
    get,
    remove,
    clear,
  };
};
