import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import {
  getAllProviderApiKeys,
  saveProviderApiKey,
  toggleProviderEnabled,
  deleteProviderApiKey,
} from "@/lib/db/provider-api-key-queries";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await getAllProviderApiKeys(session.user.id);
    
    // Return API keys with masked values for security
    // Only return the first 8 characters to indicate it's configured
    const maskedKeys = apiKeys.map((key) => ({
      id: key.id,
      userId: key.userId,
      provider: key.provider,
      apiKey: key.apiKey ? `${key.apiKey.slice(0, 8)}...` : null,
      isEnabled: key.isEnabled,
      baseUrl: key.baseUrl,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));

    return NextResponse.json({ providers: maskedKeys });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey, isEnabled, baseUrl } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    const saved = await saveProviderApiKey(
      session.user.id,
      provider,
      apiKey,
      isEnabled ?? true,
      baseUrl
    );

    return NextResponse.json({ provider: saved });
  } catch (error) {
    console.error("Error saving provider:", error);
    return NextResponse.json(
      { error: "Failed to save provider" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, isEnabled } = body;

    if (!provider || typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Provider and isEnabled are required" },
        { status: 400 }
      );
    }

    await toggleProviderEnabled(session.user.id, provider, isEnabled);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling provider:", error);
    return NextResponse.json(
      { error: "Failed to toggle provider" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    await deleteProviderApiKey(session.user.id, provider);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}

