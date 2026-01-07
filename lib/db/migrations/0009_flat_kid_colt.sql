CREATE TABLE IF NOT EXISTS "ProviderApiKey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"apiKey" text NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"baseUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProviderApiKey_userId_provider_unique" UNIQUE("userId","provider")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProviderApiKey" ADD CONSTRAINT "ProviderApiKey_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
