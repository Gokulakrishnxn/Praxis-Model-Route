import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Search Hugging Face models
    const response = await fetch(
      `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=${limit}&sort=downloads&direction=-1`,
      {
        headers: {
          "User-Agent": "Praxis/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch models from Hugging Face");
    }

    const data = await response.json();
    
    // Filter for text generation models
    const textModels = data
      .filter((model: any) => 
        model.tags?.includes("text-generation") || 
        model.tags?.includes("conversational") ||
        model.tags?.includes("chat")
      )
      .map((model: any) => ({
        id: model.id,
        name: model.id.split("/").pop(),
        author: model.id.split("/")[0],
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        tags: model.tags || [],
        modelId: model.id,
        description: model.modelCard?.data?.model_index?.general?.description || "",
      }));

    return NextResponse.json({ models: textModels });
  } catch (error) {
    console.error("Error fetching Hugging Face models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

