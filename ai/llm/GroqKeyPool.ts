import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_COOLDOWN = 60_000;

export interface KeyState {
  key: string;
  client: Groq;
  cooldownUntil: number;
}

export class GroqKeyPool {
  private readonly keys: KeyState[] = [];
  private currentIndex = 0;

  constructor() {
    const apiKeys: string[] = [];

    if (process.env.GROQ_API_KEY) {
      apiKeys.push(process.env.GROQ_API_KEY);
    }

    for (let i = 1; i <= 7; i++) {
      const key = process.env[`GROQ_API_KEY_${i}`];

      if (key) {
        apiKeys.push(key);
      }
    }

    const uniqueKeys = [...new Set(apiKeys)];

    if (uniqueKeys.length === 0) {
      throw new Error("No Groq API keys found.");
    }

    this.keys = uniqueKeys.map((key) => ({
      key,
      client: new Groq({
        apiKey: key,
      }),
      cooldownUntil: 0,
    }));
  }

  private restoreKeys() {
    const now = Date.now();

    for (const state of this.keys) {
      if (
        state.cooldownUntil !== 0 &&
        state.cooldownUntil <= now
      ) {
        state.cooldownUntil = 0;
      }
    }
  }

  private getAvailableKey(): KeyState | null {
    this.restoreKeys();

    const total = this.keys.length;

    for (let i = 0; i < total; i++) {
      const index = (this.currentIndex + i) % total;
      const state = this.keys[index];

      if (state && state.cooldownUntil === 0) {
        this.currentIndex = index;
        return state;
      }
    }

    return null;
  }

  async getClient(): Promise<KeyState> {
    while (true) {
      const state = this.getAvailableKey();

      if (state) {
        return state;
      }

      const nextAvailable = Math.min(
        ...this.keys.map((k) => k.cooldownUntil)
      );

      const waitTime = nextAvailable - Date.now();

      if (waitTime > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, waitTime)
        );
      }
    }
  }

  markSuccess(state: KeyState) {
    const index = this.keys.findIndex((k) => k.key === state.key);

    if (index !== -1) {
      this.currentIndex = index;
    }
  }

  markRateLimited(
    state: KeyState,
    retryAfterMs?: number
  ) {
    state.cooldownUntil =
      Date.now() + (retryAfterMs ?? DEFAULT_COOLDOWN);

    const index = this.keys.findIndex((k) => k.key === state.key);

    if (index !== -1) {
      this.currentIndex = (index + 1) % this.keys.length;
    }
  }

  totalKeys(): number {
    return this.keys.length;
  }
}

export const groqKeyPool = new GroqKeyPool();