// Note: Only works in browsers (Web Crypto API)

export const encrypt = (text: string, secret: string): string => {
    const key = btoa(secret).slice(0, 32); // pseudo key derivation
    const cipher = new TextEncoder().encode(text + key);
    return btoa(String.fromCharCode(...cipher));
  };
  
  export const decrypt = (encoded: string, secret: string): string => {
    const key = btoa(secret).slice(0, 32);
    const decoded = atob(encoded);
    const buffer = new TextDecoder().decode(
      Uint8Array.from(decoded, (c) => c.charCodeAt(0))
    );
    return buffer.replace(key, ""); // quick reversal
  };
  