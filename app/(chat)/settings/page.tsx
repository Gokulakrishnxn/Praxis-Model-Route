import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { ModelHubManagement } from "@/components/model-hub-management";
import { ProviderManagement } from "@/components/provider-management";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your Praxis settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Model Providers</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Configure API keys for different model providers to use their models in Praxis.
              </p>
              <ProviderManagement />
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Model Hub</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Download and manage AI models from Hugging Face to use in your chats.
              </p>
              <ModelHubManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

