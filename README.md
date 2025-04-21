# 🚀 Pocketstore

A lightweight, type-safe storage library for browser and Node.js environments with support for namespacing, TTL, and basic obfuscation.

## ✨ Features

- 🌐 Works in both browser and Node.js/SSR environments
- 🔒 Optional basic obfuscation support (not encryption)
- ⏰ Time-To-Live (TTL) support
- 🏷️ Namespace support to prevent key collisions
- 💾 Automatic fallback to memory storage in non-browser environments
- 🧹 Automatic cleanup of expired items
- 📦 Zero dependencies
- 🔍 Type-safe with TypeScript support

## 📦 Installation

```bash
# Using npm
npm install @m4dm4x/pocketstore

# Using yarn
yarn add @m4dm4x/pocketstore

# Using pnpm
pnpm add @m4dm4x/pocketstore
```

## 🎯 Use Cases

### 1. User Preferences & Settings
Perfect for storing user preferences, theme settings, or UI state that should persist across page reloads:
```typescript
const settingsStore = createStore<{theme: string, fontSize: number}>('settings');
settingsStore.set('userPrefs', { theme: 'dark', fontSize: 14 });
```

### 2. Form Data Auto-Save
Automatically save form data to prevent loss during accidental page refreshes:
```typescript
const formStore = createStore('forms', { autoCleanup: true });
formStore.set('draft', formData, 3600); // Auto-expires after 1 hour
```

### 3. API Response Caching
Cache API responses with automatic expiration:
```typescript
const cacheStore = createStore('api-cache', { autoCleanup: true });
cacheStore.set('user-data', apiResponse, 300); // Cache for 5 minutes
```

### 4. Session Management
Handle session data with automatic cleanup:
```typescript
const sessionStore = createStore('session', {
  storage: 'session',
  autoCleanup: true
});
sessionStore.set('auth', { token: '...', user: '...' }, 1800); // 30 minutes
```

### 5. Multi-Tab Communication
Store data that needs to be shared between browser tabs:
```typescript
const sharedStore = createStore('shared');
sharedStore.set('notification', { message: 'New update!' });
```

## 🔒 Security Considerations

1. **Data Sensitivity**
   - Use `obfuscate: true` only for non-sensitive data
   - Do NOT store sensitive information (passwords, tokens) without proper encryption
   - Consider using [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for sensitive data

2. **TTL & Cleanup**
   - Use TTL for temporary data (e.g., cache, sessions)
   - Enable `autoCleanup` to automatically remove expired items
   - Manually call `clear()` when handling sensitive data

3. **Storage Limitations**
   - Be aware of browser storage limits (usually 5-10MB)
   - Handle storage quota exceeded errors
   - Use compression for large data sets

## 🚀 Performance Tips

1. **Storage Type**
   - Use `localStorage` for persistent data
   - Use `sessionStorage` for temporary session data
   - Memory storage is automatically used in SSR

2. **Automatic Cleanup**
   - Enable `autoCleanup` only when necessary
   - Large stores might benefit from manual cleanup
   - Use appropriate TTL values to prevent storage bloat

3. **Data Size**
   - Store minimal necessary data
   - Consider compressing large objects
   - Use namespaces to organize and manage data

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | IE11 |
|---------|---------|----------|--------|------|------|
| Basic Storage | ✅ | ✅ | ✅ | ✅ | ✅ |
| TTL Support | ✅ | ✅ | ✅ | ✅ | ✅ |
| Obfuscation | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| SSR Support | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📊 Comparison with Other Libraries

| Feature | Pocketstore | localforage | store.js | js-cookie |
|---------|------------|-------------|-----------|-----------|
| **Size (min+gzip)** | 2KB | 8KB | 2KB | 1KB |
| **API Type** | Promise-free | Promise-based | Sync | Sync |
| **Storage Types** | localStorage, sessionStorage, memory | IndexedDB, WebSQL, localStorage | localStorage, memory | Cookies |
| **TypeScript** | ✅ Native | ⚠️ Types available | ⚠️ Types available | ⚠️ Types available |
| **SSR Support** | ✅ Built-in | ❌ Requires setup | ✅ Built-in | ✅ Built-in |
| **Namespacing** | ✅ Built-in | ❌ Manual | ❌ Manual | ✅ Built-in |
| **TTL Support** | ✅ Built-in | ❌ Manual | ❌ Manual | ✅ Built-in |
| **Auto Cleanup** | ✅ Built-in | ❌ No | ❌ No | ✅ Built-in |
| **Type Safety** | ✅ Full | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| **Browser Support** | Modern + IE11 | Modern only | Modern + IE8 | All browsers |

### Why Choose Pocketstore?

1. **Simplicity First**
   - No dependencies
   - Synchronous API (no Promises)
   - Intuitive TypeScript support

2. **Modern Features**
   - Built-in TTL support
   - Automatic cleanup
   - Type-safe by default

3. **Universal Usage**
   - Works in browsers
   - Works in Node.js/SSR
   - Works in all modern frameworks

4. **Developer Experience**
   - Full TypeScript support
   - Comprehensive documentation
   - Active maintenance

## 🚀 Quick Start

```typescript
import { createStore } from '@m4dm4x/pocketstore';

// Create a store with a namespace
const store = createStore('myapp');

// Store a value
store.set('user', { name: 'John', age: 30 });

// Get a value
const user = store.get('user'); // { name: 'John', age: 30 }

// Remove a value
store.remove('user');

// Clear all values in the namespace
store.clear();
```

## 💡 Usage Examples

### Basic Usage

```typescript
const store = createStore('myapp');

// Set and get values
store.set('theme', 'dark');
const theme = store.get('theme'); // 'dark'

// Remove values
store.remove('theme');
const removedTheme = store.get('theme'); // null
```

### With TTL (Time-To-Live)

```typescript
const store = createStore('myapp');

// Set a value that expires in 60 seconds
store.set('token', '123456', 60);

// Value is available until TTL expires
const token = store.get('token'); // '123456'

// After 60 seconds:
const expiredToken = store.get('token'); // null
```

### With Basic Obfuscation

```typescript
const store = createStore('myapp', {
  obfuscate: true,
  secret: 'your-secret-key'
});

// Values are automatically obfuscated before storage
store.set('data', { apiKey: '12345' });

// Values are automatically deobfuscated when retrieved
const data = store.get('data'); // { apiKey: '12345' }
```

> ⚠️ **Security Note**: The obfuscation feature is NOT encryption and should NOT be used for sensitive data. It provides basic obfuscation only and is suitable for non-sensitive data that you want to make slightly harder to read in the browser's dev tools.

### With Automatic Cleanup

```typescript
const store = createStore('myapp', {
  autoCleanup: true // Enable automatic cleanup
});

// Set some values with TTL
store.set('temp1', 'value1', 1); // Expires in 1 second
store.set('temp2', 'value2', 60); // Expires in 60 seconds

// After 2 seconds:
store.getAll(); // Automatically cleans up expired items
// Returns: { temp2: 'value2' }
```

### Using Different Storage Types

```typescript
// Use localStorage (default)
const localStore = createStore('myapp');

// Use sessionStorage
const sessionStore = createStore('myapp', {
  storage: 'session'
});
```

### Namespacing

```typescript
// Create stores with different namespaces
const userStore = createStore('users');
const settingsStore = createStore('settings');

// Values don't conflict even with the same key
userStore.set('data', { name: 'John' });
settingsStore.set('data', { theme: 'dark' });

userStore.get('data'); // { name: 'John' }
settingsStore.get('data'); // { theme: 'dark' }
```

### Advanced Usage

```typescript
const store = createStore('myapp');

// Check if a key exists
store.has('user'); // true/false

// Get all keys
const keys = store.keys(); // ['user', 'theme', ...]

// Get all values
const all = store.getAll(); // { user: {...}, theme: 'dark', ... }

// Initialize store (cleans up expired items if autoCleanup is enabled)
store.init();
```

## 🔧 API Reference

### `createStore<T>(namespace: string, options?: StoreOptions)`

Creates a new store instance.

#### Parameters

- `namespace`: String to prefix all keys with
- `options`: Configuration object (optional)
  - `storage`: Storage type ('local' | 'session')
  - `obfuscate`: Enable basic obfuscation (boolean)
  - `secret`: Obfuscation secret key (required if obfuscate is true)
  - `autoCleanup`: Enable automatic cleanup of expired items (boolean)

#### Returns

Object with methods:
- `set(key: string, value: T, ttlSeconds?: number): void`
- `get(key: string): T | null`
- `remove(key: string): void`
- `clear(): void`
- `has(key: string): boolean`
- `keys(): string[]`
- `getAll(): Record<string, T>`
- `init(): void`

## 🔐 Type Safety

The library includes TypeScript definitions out of the box:

```typescript
import { createStore } from '@m4dm4x/pocketstore';

interface UserData {
  name: string;
  age: number;
}

const store = createStore<UserData>('myapp');
store.set('user', { name: 'John', age: 30 });
const user = store.get('user'); // Type is UserData | null
```

## 🌐 SSR Support

The library automatically falls back to in-memory storage when running in Node.js or SSR environments, making it safe to use in server-side rendered applications.

## 📝 License

[ISC](LICENSE)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/pocketstore/issues).

## 🌟 Show your support

Give a ⭐️ if this project helped you!
