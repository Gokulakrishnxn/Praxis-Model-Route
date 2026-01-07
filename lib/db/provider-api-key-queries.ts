import "server-only";

import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { providerApiKey } from "./schema";
import type { ProviderApiKey } from "./schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getProviderApiKey(
  userId: string,
  provider: string
): Promise<ProviderApiKey | null> {
  try {
    const result = await db
      .select()
      .from(providerApiKey)
      .where(
        and(
          eq(providerApiKey.userId, userId),
          eq(providerApiKey.provider, provider)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error getting provider API key:", error);
    return null;
  }
}

export async function getAllProviderApiKeys(
  userId: string
): Promise<ProviderApiKey[]> {
  try {
    return await db
      .select()
      .from(providerApiKey)
      .where(eq(providerApiKey.userId, userId));
  } catch (error) {
    console.error("Error getting all provider API keys:", error);
    return [];
  }
}

export async function saveProviderApiKey(
  userId: string,
  provider: string,
  apiKey: string,
  isEnabled: boolean = true,
  baseUrl?: string
): Promise<ProviderApiKey> {
  try {
    const existing = await getProviderApiKey(userId, provider);

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(providerApiKey)
        .set({
          apiKey,
          isEnabled,
          baseUrl: baseUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(providerApiKey.id, existing.id))
        .returning();

      return updated;
    } else {
      // Create new
      const [created] = await db
        .insert(providerApiKey)
        .values({
          userId,
          provider,
          apiKey,
          isEnabled,
          baseUrl: baseUrl || null,
        })
        .returning();

      return created;
    }
  } catch (error) {
    console.error("Error saving provider API key:", error);
    throw error;
  }
}

export async function toggleProviderEnabled(
  userId: string,
  provider: string,
  isEnabled: boolean
): Promise<void> {
  try {
    const existing = await getProviderApiKey(userId, provider);
    if (existing) {
      await db
        .update(providerApiKey)
        .set({ isEnabled, updatedAt: new Date() })
        .where(eq(providerApiKey.id, existing.id));
    }
  } catch (error) {
    console.error("Error toggling provider enabled:", error);
    throw error;
  }
}

export async function deleteProviderApiKey(
  userId: string,
  provider: string
): Promise<void> {
  try {
    await db
      .delete(providerApiKey)
      .where(
        and(
          eq(providerApiKey.userId, userId),
          eq(providerApiKey.provider, provider)
        )
      );
  } catch (error) {
    console.error("Error deleting provider API key:", error);
    throw error;
  }
}

