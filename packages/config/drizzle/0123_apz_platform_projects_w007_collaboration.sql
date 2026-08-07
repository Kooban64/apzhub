-- W007 / PX-04 — object-anchored collaboration SoR.

CREATE TABLE IF NOT EXISTS platform_project_conversation (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  programme_id text,
  anchor_type text NOT NULL,
  anchor_id text NOT NULL,
  conversation_type text NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'open',
  decision_outcome text,
  watcher_principal_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  unread_count integer NOT NULL DEFAULT 0,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_conversation_project_idx
  ON platform_project_conversation (tenant_id, project_id, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_conversation_anchor_idx
  ON platform_project_conversation (tenant_id, project_id, anchor_type, anchor_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_conversation_message (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  conversation_id text NOT NULL REFERENCES platform_project_conversation(id),
  body text NOT NULL,
  author_principal_id text NOT NULL,
  message_type text NOT NULL DEFAULT 'comment',
  linked_object_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  mention_principal_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_conversation_message_conv_idx
  ON platform_project_conversation_message (tenant_id, conversation_id, created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_meeting_outcome (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  held_at timestamptz NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  attendee_principal_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  decisions_recorded jsonb NOT NULL DEFAULT '[]'::jsonb,
  commitments_captured jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks_raised jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions_captured jsonb NOT NULL DEFAULT '[]'::jsonb,
  linked_object_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  recording_ref text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_meeting_outcome_scope_idx
  ON platform_project_meeting_outcome (tenant_id, scope_type, scope_id, held_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_notice (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  pinned boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  author_principal_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_notice_scope_idx
  ON platform_project_notice (tenant_id, scope_type, scope_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_announcement (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'info',
  audience text NOT NULL DEFAULT 'core',
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  acknowledge_required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  author_principal_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_announcement_scope_idx
  ON platform_project_announcement (tenant_id, scope_type, scope_id, status);
