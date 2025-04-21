import { StoreOptions, StoredValue, Store } from "./types";
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

export const createStore = <T = any>(namespace: string, options: StoreOptions = {}): Store<T> => {
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

  // Handle deprecation warning for encrypt option
  if (options.encrypt !== undefined) {
    console.warn(
      'Pocketstore: The "encrypt" option is deprecated. Please use "obfuscate" instead. ' +
      'This option will be removed in a future version.'
    );
  }

  // Determine if we should obfuscate (either through new or deprecated option)
  const shouldObfuscate = options.obfuscate || options.encrypt;

  const cleanupExpired = () => {
    if (!options.autoCleanup) return;
    
    const keys = getAllKeys();
    keys.forEach(key => {
      const raw = storage.getItem(prefix + key);
      if (!raw) return;

      try {
        const decrypted = shouldObfuscate && options.secret ? decrypt(raw, options.secret) : raw;
        const parsed = JSON.parse(decrypted) as StoredValue<T>;
        
        if (parsed.expiry && Date.now() > parsed.expiry) {
          remove(key);
        }
      } catch {
        // If we can't parse the value, remove it
        remove(key);
      }
    });
  };

  const getAllKeys = (): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.slice(prefix.length));
      }
    }
    return keys;
  };

  const set = (key: string, value: T, ttlSeconds?: number) => {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    let raw = JSON.stringify({ value, expiry });

    if (shouldObfuscate && options.secret) {
      raw = encrypt(raw, options.secret);
    }

    storage.setItem(prefix + key, raw);
  };

  const get = (key: string): T | null => {
    const raw = storage.getItem(prefix + key);
    if (!raw) return null;

    let parsed: StoredValue<T>;
    try {
      const decrypted =
        shouldObfuscate && options.secret ? decrypt(raw, options.secret) : raw;
      parsed = JSON.parse(decrypted);
    } catch {
      return null;
    }

    // Check if the item is expired
    const isExpired = parsed.expiry && Date.now() > parsed.expiry;
    
    // If expired, handle based on autoCleanup setting
    if (isExpired) {
      if (options.autoCleanup) {
        remove(key);
      }
      return null;
    }
    
    return parsed.value;
  };

  const remove = (key: string) => {
    storage.removeItem(prefix + key);
  };

  const clear = () => {
    // Get all keys first to avoid issues with index shifting during removal
    const keys = getAllKeys();
    // Remove all matching keys
    keys.forEach(key => storage.removeItem(prefix + key));
  };

  const has = (key: string): boolean => {
    return get(key) !== null;
  };

  const keys = (): string[] => {
    return getAllKeys();
  };

  const getAll = (): Record<string, T> => {
    cleanupExpired();
    
    const result: Record<string, T> = {};
    const allKeys = getAllKeys();
    
    allKeys.forEach(key => {
      const value = get(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    
    return result;
  };

  const init = () => {
    cleanupExpired();
  };

  // Initialize on creation if autoCleanup is enabled
  if (options.autoCleanup) {
    init();
  }

  return {
    set,
    get,
    remove,
    clear,
    has,
    keys,
    getAll,
    init,
  };
};
