import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminLogAction,
  AuditEventLevel,
  AuditEventSeverity,
  AuditEventType,
  Database,
  Json,
} from "@/types/database";

type Supabase = SupabaseClient<Database>;

export type AdminLogInput = {
  action: AdminLogAction;
  actorProfileId: string;
  afterData?: unknown;
  beforeData?: unknown;
  reason?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  targetTable: string;
};

export type AuditEventInput = {
  actorProfileId?: string | null;
  errorCode?: string | null;
  eventLevel: AuditEventLevel;
  eventType: AuditEventType;
  message?: string | null;
  metadata?: Json;
  severity?: AuditEventSeverity;
  targetId?: string | null;
  targetTable?: string | null;
};

type WriteLogResult = {
  error: string | null;
  ok: boolean;
};

function toJson(value: unknown): Json | null {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function writeAdminLog(
  supabase: Supabase,
  input: AdminLogInput,
): Promise<WriteLogResult> {
  const { error } = await supabase.from("admin_logs").insert({
    action: input.action,
    actor_profile_id: input.actorProfileId,
    after_data: toJson(input.afterData),
    before_data: toJson(input.beforeData),
    created_by: input.actorProfileId,
    metadata: {},
    reason: input.reason,
    target_id: input.targetId,
    target_label: input.targetLabel,
    target_table: input.targetTable,
  });

  if (error) {
    return { error: error.message, ok: false };
  }

  return { error: null, ok: true };
}

export async function writeAuditEvent(
  supabase: Supabase,
  input: AuditEventInput,
): Promise<WriteLogResult> {
  const { error } = await supabase.from("audit_events").insert({
    actor_profile_id: input.actorProfileId,
    created_by: input.actorProfileId,
    error_code: input.errorCode,
    event_level: input.eventLevel,
    event_type: input.eventType,
    message: input.message,
    metadata: input.metadata ?? {},
    severity: input.severity ?? "info",
    target_id: input.targetId,
    target_table: input.targetTable,
  });

  if (error) {
    return { error: error.message, ok: false };
  }

  return { error: null, ok: true };
}
