"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DownloadIcon, SearchIcon } from "./icons";

export function ModelHubDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchModels = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/models/huggingface?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.models || []);
      }
    } catch (error) {
      console.error("Error searching models:", error);
      toast.error("Failed to search models");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchModels(searchQuery);
  };

  const downloadModel = async (model: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/models/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: model.modelId,
          name: model.name,
          description: model.description,
          tags: model.tags,
        }),
      });

      if (response.ok) {
        toast.success(`Download started for ${model.name}`);
        onOpenChange(false);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to start download");
      }
    } catch (error) {
      console.error("Error downloading model:", error);
      toast.error("Failed to download model");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Hub - Download Models</DialogTitle>
          <DialogDescription>
            Search and download AI models from Hugging Face
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for models (e.g., 'llama', 'mistral')..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  searchModels(e.target.value);
                }
              }}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((model) => (
              <Card key={model.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {model.modelId}
                    </p>
                    {model.description && (
                      <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                        {model.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {model.downloads?.toLocaleString()} downloads
                      </Badge>
                      <Badge variant="outline">{model.likes} likes</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadModel(model)}
                    disabled={isLoading}
                    className="ml-4"
                  >
                    <DownloadIcon size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-muted-foreground text-center py-4">
                No models found
              </p>
            )}
            {!searchQuery && (
              <p className="text-muted-foreground text-center py-4">
                Enter a search term to find models
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

