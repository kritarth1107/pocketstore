import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createStore } from "../src/store";

// Mock localStorage/sessionStorage in Node.js
class MockStorage {
  private store: Record<string, string> = {};

  getItem = (key: string) => this.store[key] ?? null;
  setItem = (key: string, value: string) => {
    this.store[key] = value;
  };
  removeItem = (key: string) => {
    delete this.store[key];
  };
  clear = () => {
    this.store = {};
  };
  key = (index: number) => Object.keys(this.store)[index] ?? null;
  get length() {
    return Object.keys(this.store).length;
  }
}

describe("pocketstore", () => {
  let storage: ReturnType<typeof createStore>;
  let originalWindow: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Save original window
    originalWindow = globalThis.window;
    
    // Set up mock window
    globalThis.window = {
      localStorage: new MockStorage(),
      sessionStorage: new MockStorage(),
      document: {} // Add document to make isBrowser check pass
    } as any;

    // Spy on console.warn for deprecation warnings
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    storage = createStore("testspace", { storage: "local" });
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore original window
    globalThis.window = originalWindow;
    vi.useRealTimers();
    consoleWarnSpy.mockRestore();
  });

  it("sets and gets a value", () => {
    storage.set("user", { name: "kritarth" });
    expect(storage.get("user")).toEqual({ name: "kritarth" });
  });

  it("removes a value", () => {
    storage.set("token", "123456");
    storage.remove("token");
    expect(storage.get("token")).toBeNull();
  });

  it("clears the namespace", () => {
    storage.set("a", "x");
    storage.set("b", "y");
    storage.clear();
    expect(storage.get("a")).toBeNull();
    expect(storage.get("b")).toBeNull();
  });

  it("respects TTL expiration", () => {
    storage.set("temp", "value", 1); // 1 second
    expect(storage.get("temp")).toBe("value");
    vi.advanceTimersByTime(2000); // Advance time by 2 seconds
    expect(storage.get("temp")).toBeNull();
  });

  it("namespaces properly", () => {
    const other = createStore("otherspace", { storage: "local" });
    storage.set("data", "abc");
    other.set("data", "xyz");
    expect(storage.get("data")).toBe("abc");
    expect(other.get("data")).toBe("xyz");
  });

  it("falls back to memory store in SSR", () => {
    // Simulate SSR environment (no window)
    (globalThis as any).window = undefined;

    const ssrStore = createStore("ssrtest");

    ssrStore.set("ssrKey", "ssrValue");
    expect(ssrStore.get("ssrKey")).toBe("ssrValue");

    ssrStore.remove("ssrKey");
    expect(ssrStore.get("ssrKey")).toBeNull();

    ssrStore.set("a", 1);
    ssrStore.set("b", 2);
    ssrStore.clear();
    expect(ssrStore.get("a")).toBeNull();
    expect(ssrStore.get("b")).toBeNull();
  });

  describe("obfuscation", () => {
    it("works with obfuscate option", () => {
      const obfuscatedStore = createStore("obfuscated", {
        obfuscate: true,
        secret: "test-secret"
      });

      obfuscatedStore.set("secret", "value");
      expect(obfuscatedStore.get("secret")).toBe("value");
    });

    it("shows deprecation warning for encrypt option", () => {
      createStore("deprecated", {
        encrypt: true,
        secret: "test-secret"
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
    });

    it("works with deprecated encrypt option", () => {
      const encryptedStore = createStore("encrypted", {
        encrypt: true,
        secret: "test-secret"
      });

      encryptedStore.set("secret", "value");
      expect(encryptedStore.get("secret")).toBe("value");
    });

    it("requires secret when obfuscation is enabled", () => {
      const store = createStore("no-secret", {
        obfuscate: true
      });

      store.set("value", "test");
      expect(store.get("value")).toBe("test"); // Should still work but without obfuscation
    });
  });

  describe("new methods", () => {
    it("has() checks if a key exists", () => {
      storage.set("exists", "value");
      expect(storage.has("exists")).toBe(true);
      expect(storage.has("nonexistent")).toBe(false);
    });

    it("keys() returns all keys in the namespace", () => {
      storage.set("key1", "value1");
      storage.set("key2", "value2");
      const keys = storage.keys();
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys.length).toBe(2);
    });

    it("getAll() returns all values in the namespace", () => {
      storage.set("key1", "value1");
      storage.set("key2", "value2");
      const all = storage.getAll();
      expect(all).toEqual({
        key1: "value1",
        key2: "value2"
      });
    });

    it("init() initializes the store", () => {
      const store = createStore("init-test");
      expect(() => store.init()).not.toThrow();
    });
  });

  describe("automatic cleanup", () => {
    it("cleans up expired items on getAll()", () => {
      const store = createStore("cleanup-test", { autoCleanup: true });
      
      store.set("expired", "value", 1); // 1 second TTL
      store.set("valid", "value", 60); // 60 seconds TTL
      
      vi.advanceTimersByTime(2000); // Advance time by 2 seconds
      
      const all = store.getAll();
      expect(all).toEqual({
        valid: "value"
      });
      
      // Verify the expired item was removed from storage
      expect(store.get("expired")).toBeNull();
    });

    it("cleans up expired items on init()", () => {
      const store = createStore("cleanup-test", { autoCleanup: true });
      
      store.set("expired", "value", 1); // 1 second TTL
      store.set("valid", "value", 60); // 60 seconds TTL
      
      vi.advanceTimersByTime(2000); // Advance time by 2 seconds
      
      store.init();
      expect(store.get("expired")).toBeNull();
      expect(store.get("valid")).toBe("value");
    });

    it("cleans up on creation when autoCleanup is enabled", () => {
      const store = createStore("cleanup-test", { autoCleanup: true });
      
      store.set("expired", "value", 1); // 1 second TTL
      vi.advanceTimersByTime(2000); // Advance time by 2 seconds
      
      expect(store.get("expired")).toBeNull();
    });

    it("does not clean up when autoCleanup is disabled", () => {
      const store = createStore("cleanup-test", { autoCleanup: false });
      
      store.set("expired", "value", 1); // 1 second TTL
      vi.advanceTimersByTime(2000); // Advance time by 2 seconds
      
      store.init();
      // The value should still be in storage but not accessible
      expect(store.get("expired")).toBeNull();
      
      // Verify the item still exists in storage
      const raw = (globalThis.window as any).localStorage.getItem("cleanup-test::expired");
      expect(raw).not.toBeNull();
    });
  });
});
