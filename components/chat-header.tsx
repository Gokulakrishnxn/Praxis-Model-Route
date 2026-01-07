"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, GitHubIcon, BoxIcon, SettingsIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";
import { ModelHubDialog } from "./model-hub-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const [isModelHubOpen, setIsModelHubOpen] = useState(false);

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Button
          className="order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant="outline"
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="order-1 md:order-2"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      <div className="order-3 hidden md:ml-auto md:flex md:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-10 w-10 rounded-full bg-zinc-900 p-0 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={() => setIsModelHubOpen(true)}
              variant="ghost"
            >
              <BoxIcon size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Model Hub - Download Models</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              className="h-10 w-10 rounded-full bg-zinc-900 p-0 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Link href="/settings">
                <SettingsIcon size={20} />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <Button
          asChild
          className="h-10 w-10 rounded-full bg-zinc-900 p-0 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Link
            href={"https://github.com/Gokulakrishnxn/Praxis-Model-Route.git"}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon size={20} />
          </Link>
        </Button>
      </div>

      <ModelHubDialog open={isModelHubOpen} onOpenChange={setIsModelHubOpen} />
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
