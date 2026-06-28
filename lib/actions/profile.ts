"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditEvent } from "@/lib/audit/logs";
import { requireDashboardRoute } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(formData: FormData): Promise<never> {
  const context = await requireDashboardRoute();
  const displayName = getFormString(formData, "displayName");
  const phone = getFormString(formData, "phone");
  const countryId = getFormString(formData, "countryId");
  const primaryLanguage = getFormString(formData, "primaryLanguage");

  if (!displayName) {
    redirect("/dashboard/account?error=missing_fields");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      country_id: countryId || null,
      display_name: displayName,
      phone: phone || null,
      primary_language: primaryLanguage || null,
    })
    .eq("id", context.profileId);

  if (error) {
    redirect("/dashboard/account?error=update_failed");
  }

  const { error: activityError } = await supabase.from("activity_logs").insert({
    activity_type: "profile_updated",
    actor_profile_id: context.profileId,
    created_by: context.profileId,
    metadata: {},
    profile_id: context.profileId,
    summary: displayName,
  });

  if (activityError) {
    await writeAuditEvent(supabase, {
      actorProfileId: context.profileId,
      errorCode: "activity_log_insert_failed",
      eventLevel: "system",
      eventType: "system_change",
      message: activityError.message,
      severity: "warning",
      targetId: context.profileId,
      targetTable: "profiles",
    });
  }

  revalidatePath("/dashboard/account");
  revalidatePath("/dashboard");
  redirect("/dashboard/account?notice=update_success");
}
