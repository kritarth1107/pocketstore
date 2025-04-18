export type StoreType = "local" | "session";

export interface StoreOptions {
  storage?: StoreType;
  encrypt?: boolean;
  secret?: string;
}

export interface StoredValue {
  value: any;
  expiry?: number;
}
