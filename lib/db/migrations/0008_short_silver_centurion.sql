CREATE TABLE IF NOT EXISTS "ModelHub" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"modelId" text NOT NULL,
	"provider" varchar(64) DEFAULT 'huggingface' NOT NULL,
	"status" varchar DEFAULT 'downloading' NOT NULL,
	"localPath" text,
	"size" text,
	"description" text,
	"tags" json,
	"downloadProgress" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ModelHub" ADD CONSTRAINT "ModelHub_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "lastContext";