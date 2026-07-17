import { redis } from '../config/redis.js';

export const CACHE_KEYS = {
  contracts: 'contracts:list',
  summary: 'contracts:summary',
};

const TTL_SECONDS = 30;

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
  } catch {
    // cache é best-effort: falha de Redis não deve derrubar a request
  }
}

export async function invalidateContractCaches(): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.contracts, CACHE_KEYS.summary);
  } catch {
    // idem
  }
}
