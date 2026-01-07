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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SettingsIcon, EyeIcon, EyeOffIcon, CopyIcon } from "./icons";
import { chatModels } from "@/lib/ai/models";

type Provider = {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon?: string;
  apiKey?: string;
  isEnabled: boolean;
  baseUrl?: string;
  modelCount: number;
};

const PROVIDERS: Omit<Provider, "apiKey" | "isEnabled" | "baseUrl">[] = [
  {
    id: "google-api",
    name: "Google API",
    provider: "google-api",
    description: "Direct Google API integration for Gemini models",
    icon: "google",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    provider: "openrouter",
    description: "Access 100+ models from multiple providers with one API key",
    icon: "openrouter",
  },
];

export function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/providers");
      if (response.ok) {
        const data = await response.json();
        const savedProviders = data.providers || [];

        // Calculate model counts
        const modelCounts = PROVIDERS.map((p) => {
          const count = chatModels.filter((m) => m.provider === p.provider).length;
          const saved = savedProviders.find((sp: any) => sp.provider === p.provider);
          return {
            ...p,
            apiKey: saved?.apiKey || "",
            isEnabled: saved?.isEnabled ?? false,
            baseUrl: saved?.baseUrl || "",
            modelCount: count,
          };
        });

        setProviders(modelCounts);
        // Note: API keys are masked from the server, so we don't populate them here
        // Users need to re-enter them if they want to update
        savedProviders.forEach((sp: any) => {
          if (sp.baseUrl) {
            setBaseUrls((prev) => ({ ...prev, [sp.provider]: sp.baseUrl }));
          }
        });
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProvider = async (provider: string) => {
    try {
      const apiKey = apiKeys[provider];
      if (!apiKey || apiKey.trim() === "") {
        toast.error("Please enter an API key");
        return;
      }

      // Don't save if the API key looks masked (contains "...")
      if (apiKey.includes("...")) {
        toast.error("Please enter a new API key (masked keys cannot be updated)");
        return;
      }

      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          isEnabled: providers.find((p) => p.provider === provider)?.isEnabled ?? true,
          baseUrl: baseUrls[provider] || undefined,
        }),
      });

      if (response.ok) {
        toast.success(`${PROVIDERS.find((p) => p.provider === provider)?.name} API key saved`);
        setEditingProvider(null);
        setApiKeys((prev) => ({ ...prev, [provider]: "" })); // Clear the input
        await fetchProviders();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save API key");
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      toast.error("Failed to save API key");
    }
  };

  const toggleProvider = async (provider: string, isEnabled: boolean) => {
    try {
      const response = await fetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, isEnabled }),
      });

      if (response.ok) {
        setProviders((prev) =>
          prev.map((p) => (p.provider === provider ? { ...p, isEnabled } : p))
        );
        toast.success(
          `${PROVIDERS.find((p) => p.provider === provider)?.name} ${
            isEnabled ? "enabled" : "disabled"
          }`
        );
      } else {
        toast.error("Failed to toggle provider");
      }
    } catch (error) {
      console.error("Error toggling provider:", error);
      toast.error("Failed to toggle provider");
    }
  };

  const copyApiKey = (provider: string) => {
    const apiKey = apiKeys[provider];
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API key copied to clipboard");
    }
  };

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading providers...</div>;
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => {
        const hasApiKey = !!apiKeys[provider.provider] && apiKeys[provider.provider] !== "null";
        const isEditing = editingProvider === provider.provider;

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-lg font-semibold">
                      {provider.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{provider.modelCount} Models</div>
                    <div className="text-xs text-muted-foreground">
                      {hasApiKey ? "Configured" : "Not configured"}
                    </div>
                  </div>
                  <Switch
                    checked={provider.isEnabled && hasApiKey}
                    onCheckedChange={(checked) => {
                      if (hasApiKey) {
                        toggleProvider(provider.provider, checked);
                      } else {
                        toast.error("Please configure API key first");
                      }
                    }}
                    disabled={!hasApiKey}
                  />
                  <Dialog
                    open={isEditing}
                    onOpenChange={(open) => setEditingProvider(open ? provider.provider : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <SettingsIcon size={18} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{provider.name} Settings</DialogTitle>
                        <DialogDescription>
                          Configure your {provider.name} API key to use models from this provider.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor={`api-key-${provider.provider}`}>
                            API Key
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`api-key-${provider.provider}`}
                              type={showApiKeys[provider.provider] ? "text" : "password"}
                              placeholder={
                                provider.provider === "google-api"
                                  ? "Enter your Google API key"
                                  : "Enter your OpenRouter API key"
                              }
                              value={apiKeys[provider.provider] || ""}
                              onChange={(e) =>
                                setApiKeys((prev) => ({
                                  ...prev,
                                  [provider.provider]: e.target.value,
                                }))
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleShowApiKey(provider.provider)}
                            >
                              {showApiKeys[provider.provider] ? (
                                <EyeOffIcon size={16} />
                              ) : (
                                <EyeIcon size={16} />
                              )}
                            </Button>
                            {hasApiKey && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyApiKey(provider.provider)}
                              >
                                <CopyIcon size={16} />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {provider.provider === "google-api" ? (
                              <>
                                Get your API key from{" "}
                                <a
                                  href="https://makersuite.google.com/app/apikey"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline"
                                >
                                  Google AI Studio
                                </a>
                              </>
                            ) : (
                              <>
                                Get your API key from{" "}
                                <a
                                  href="https://openrouter.ai/keys"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline"
                                >
                                  OpenRouter
                                </a>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingProvider(null)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => saveProvider(provider.provider)}>
                            Save API Key
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {hasApiKey ? (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    API key configured • {provider.modelCount} models available
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                    Click settings to configure API key • {provider.modelCount} models available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

