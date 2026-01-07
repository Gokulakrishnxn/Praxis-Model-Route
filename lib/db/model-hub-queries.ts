import "server-only";

import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ChatSDKError } from "../errors";
import { modelHub, type ModelHub } from "./schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getModelsByUserId(userId: string): Promise<ModelHub[]> {
  try {
    return await db
      .select()
      .from(modelHub)
      .where(eq(modelHub.userId, userId))
      .orderBy(desc(modelHub.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get models by user id"
    );
  }
}

export async function getModelById(id: string): Promise<ModelHub | null> {
  try {
    const [model] = await db.select().from(modelHub).where(eq(modelHub.id, id));
    return model ?? null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get model by id");
  }
}

export async function createModel(data: {
  name: string;
  modelId: string;
  provider: string;
  userId: string;
  description?: string;
  tags?: string[];
  size?: string;
}) {
  try {
    const [model] = await db
      .insert(modelHub)
      .values({
        name: data.name,
        modelId: data.modelId,
        provider: data.provider,
        userId: data.userId,
        description: data.description,
        tags: data.tags,
        size: data.size,
        status: "downloading",
      })
      .returning();
    return model;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create model");
  }
}

export async function updateModelStatus(
  id: string,
  status: "downloading" | "ready" | "error" | "deleting",
  localPath?: string,
  downloadProgress?: unknown
) {
  try {
    const [model] = await db
      .update(modelHub)
      .set({
        status,
        localPath,
        downloadProgress,
        updatedAt: new Date(),
      })
      .where(eq(modelHub.id, id))
      .returning();
    return model;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update model status");
  }
}

export async function deleteModelById(id: string) {
  try {
    const [deletedModel] = await db
      .delete(modelHub)
      .where(eq(modelHub.id, id))
      .returning();
    return deletedModel;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete model");
  }
}

