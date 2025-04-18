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

  beforeEach(() => {
    // Save original window
    originalWindow = globalThis.window;
    
    // Set up mock window
    globalThis.window = {
      localStorage: new MockStorage(),
      sessionStorage: new MockStorage(),
      document: {} // Add document to make isBrowser check pass
    } as any;

    storage = createStore("testspace", { storage: "local" });
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore original window
    globalThis.window = originalWindow;
    vi.useRealTimers();
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
});
