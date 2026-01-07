"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, DownloadIcon, SearchIcon } from "./icons";
import type { ModelHub } from "@/lib/db/schema";

export function ModelHubManagement() {
  const [models, setModels] = useState<ModelHub[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

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
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchModels();
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

  const deleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) {
      return;
    }

    try {
      const response = await fetch(`/api/models?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Model deleted successfully");
        fetchModels();
      } else {
        toast.error("Failed to delete model");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/10 text-green-500";
      case "downloading":
        return "bg-blue-500/10 text-blue-500";
      case "error":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <SearchIcon size={16} className="mr-2" />
                Search Hugging Face Models
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Search Models</DialogTitle>
                <DialogDescription>
                  Search and download models from Hugging Face
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
                            <Badge variant="outline">
                              {model.likes} likes
                            </Badge>
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
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Models</CardTitle>
          <CardDescription>
            Models you've downloaded from Hugging Face
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No models downloaded yet. Search and download models to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {model.modelId}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{model.size || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteModel(model.id)}
                        disabled={model.status === "downloading"}
                      >
                        <TrashIcon size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

