# 🚀 Pocketstore

A lightweight, type-safe storage library for browser and Node.js environments with support for namespacing, TTL, and encryption.

## ✨ Features

- 🌐 Works in both browser and Node.js/SSR environments
- 🔒 Optional encryption support
- ⏰ Time-To-Live (TTL) support
- 🏷️ Namespace support to prevent key collisions
- 💾 Automatic fallback to memory storage in non-browser environments
- 📦 Zero dependencies
- 🔍 Type-safe with TypeScript support

## 📦 Installation

```bash
# Using npm
npm install pocketstore

# Using yarn
yarn add pocketstore

# Using pnpm
pnpm add pocketstore
```

## 🚀 Quick Start

```typescript
import { createStore } from 'pocketstore';

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

### With Encryption

```typescript
const store = createStore('myapp', {
  encrypt: true,
  secret: 'your-secret-key'
});

// Values are automatically encrypted before storage
store.set('sensitiveData', { apiKey: '12345' });

// Values are automatically decrypted when retrieved
const data = store.get('sensitiveData'); // { apiKey: '12345' }
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

## 🔧 API Reference

### `createStore(namespace: string, options?: StoreOptions)`

Creates a new store instance.

#### Parameters

- `namespace`: String to prefix all keys with
- `options`: Configuration object (optional)
  - `storage`: Storage type ('local' | 'session')
  - `encrypt`: Enable encryption (boolean)
  - `secret`: Encryption secret key (required if encrypt is true)

#### Returns

Object with methods:
- `set(key: string, value: any, ttlSeconds?: number): void`
- `get(key: string): any | null`
- `remove(key: string): void`
- `clear(): void`

## 🔐 Type Safety

The library includes TypeScript definitions out of the box:

```typescript
import { createStore } from 'pocketstore';

interface UserData {
  name: string;
  age: number;
}

const store = createStore('myapp');
store.set('user', { name: 'John', age: 30 } as UserData);
const user = store.get('user') as UserData;
```

## 🌐 SSR Support

The library automatically falls back to in-memory storage when running in Node.js or SSR environments, making it safe to use in server-side rendered applications.

## 📝 License

[ISC](LICENSE)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/pocketstore/issues).

## 🌟 Show your support

Give a ⭐️ if this project helped you!
