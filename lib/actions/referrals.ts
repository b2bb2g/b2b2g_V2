"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditEvent } from "@/lib/audit/logs";
import { requireDashboardRoute } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildReferralUrl(code: string): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return `${origin}/signup?ref=${code}`;
}

function buildMemberReferralUrl(code: string, targetMemberType: "buyer" | "student"): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return `${origin}/signup?invite=${code}&type=${targetMemberType}`;
}

function createReferralCodeSeed(profileId: string, prefix = "B2B"): string {
  const compactId = profileId.replaceAll("-", "").slice(0, 8).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}${compactId}${random}`;
}

function getRoleInviteConfig(memberTypeCode: string) {
  if (memberTypeCode === "agent") {
    return {
      ownerMemberType: "agent" as const,
      prefix: "AGT",
      targetMemberType: "buyer" as const,
    };
  }

  if (memberTypeCode === "professor") {
    return {
      ownerMemberType: "professor" as const,
      prefix: "PRO",
      targetMemberType: "student" as const,
    };
  }

  return null;
}

export async function generateBuyerReferralCode(): Promise<never> {
  const context = await requireDashboardRoute();
  const supabase = await createSupabaseServerClient();
  const { data: buyerId } = await supabase.rpc("current_buyer_id");

  if (!buyerId) {
    redirect("/dashboard/referrals?error=buyer_only");
  }

  const { data: existingCode } = await supabase
    .from("referral_codes")
    .select("id,code,is_active,referral_url")
    .eq("buyer_id", buyerId)
    .maybeSingle();

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch {
    redirect("/dashboard/referrals?error=service_unavailable");
  }

  if (existingCode) {
    const referralUrl = existingCode.referral_url ?? buildReferralUrl(existingCode.code);
    const { error } = await adminSupabase
      .from("referral_codes")
      .update({
        is_active: true,
        referral_url: referralUrl,
        updated_by: context.profileId,
      })
      .eq("id", existingCode.id);

    if (error) {
      redirect("/dashboard/referrals?error=generate_failed");
    }

    revalidatePath("/dashboard/referrals");
    redirect("/dashboard/referrals?notice=code_ready");
  }

  const code = createReferralCodeSeed(context.profileId);
  const { error } = await adminSupabase.from("referral_codes").insert({
    buyer_id: buyerId,
    code,
    created_by: context.profileId,
    is_active: true,
    referral_url: buildReferralUrl(code),
    updated_by: context.profileId,
  });

  if (error) {
    await writeAuditEvent(adminSupabase, {
      actorProfileId: context.profileId,
      errorCode: "referral_code_generate_failed",
      eventLevel: "system",
      eventType: "system_change",
      message: error.message,
      severity: "warning",
      targetId: buyerId,
      targetTable: "referral_codes",
    });
    redirect("/dashboard/referrals?error=generate_failed");
  }

  revalidatePath("/dashboard/referrals");
  redirect("/dashboard/referrals?notice=code_ready");
}

export async function generateReferralCode(): Promise<never> {
  const context = await requireDashboardRoute();

  if (context.memberTypeCode === "buyer") {
    return generateBuyerReferralCode();
  }

  const inviteConfig = getRoleInviteConfig(context.memberTypeCode);

  if (!inviteConfig) {
    redirect("/dashboard/referrals?error=unsupported_role");
  }

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch {
    redirect("/dashboard/referrals?error=service_unavailable");
  }

  const { data: existingCode, error: existingError } = await adminSupabase
    .from("member_referral_codes")
    .select("id,code,referral_url")
    .eq("owner_profile_id", context.profileId)
    .eq("target_member_type", inviteConfig.targetMemberType)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    redirect("/dashboard/referrals?error=generate_failed");
  }

  if (existingCode) {
    const referralUrl =
      existingCode.referral_url ??
      buildMemberReferralUrl(existingCode.code, inviteConfig.targetMemberType);
    const { error } = await adminSupabase
      .from("member_referral_codes")
      .update({
        is_active: true,
        referral_url: referralUrl,
        updated_by: context.profileId,
      })
      .eq("id", existingCode.id);

    if (error) {
      redirect("/dashboard/referrals?error=generate_failed");
    }

    revalidatePath("/dashboard/referrals");
    redirect("/dashboard/referrals?notice=code_ready");
  }

  const code = createReferralCodeSeed(context.profileId, inviteConfig.prefix);
  const referralUrl = buildMemberReferralUrl(code, inviteConfig.targetMemberType);
  const { error } = await adminSupabase.from("member_referral_codes").insert({
    code,
    created_by: context.profileId,
    is_active: true,
    owner_member_type: inviteConfig.ownerMemberType,
    owner_profile_id: context.profileId,
    referral_url: referralUrl,
    target_member_type: inviteConfig.targetMemberType,
    updated_by: context.profileId,
  });

  if (error) {
    await writeAuditEvent(adminSupabase, {
      actorProfileId: context.profileId,
      errorCode: "member_referral_code_generate_failed",
      eventLevel: "system",
      eventType: "system_change",
      message: error.message,
      severity: "warning",
      targetId: context.profileId,
      targetTable: "member_referral_codes",
    });
    redirect("/dashboard/referrals?error=generate_failed");
  }

  revalidatePath("/dashboard/referrals");
  redirect("/dashboard/referrals?notice=code_ready");
}
