import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, MemberReferralTargetType } from "@/types/database";

export const SIGNUP_POLICY_SETTING_KEY = "auth.signup_policy";

export type SignupPolicy = {
  allowPublicSignup: boolean;
  mode: "open" | "referral_only";
};

export type ReferralInvite =
  | {
      buyerId: string;
      code: string;
      id: string;
      source: "buyer";
      targetMemberType: "buyer";
    }
  | {
      code: string;
      id: string;
      ownerProfileId: string;
      source: "member";
      targetMemberType: MemberReferralTargetType;
    };

function isJsonObject(value: Json): value is Record<string, Json | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSignupPolicy(value: Json | null | undefined): SignupPolicy {
  if (!value || !isJsonObject(value)) {
    return { allowPublicSignup: true, mode: "open" };
  }

  const allowPublicSignup = value.allowPublicSignup;
  const mode = value.mode;

  if (typeof allowPublicSignup === "boolean") {
    return {
      allowPublicSignup,
      mode: allowPublicSignup ? "open" : "referral_only",
    };
  }

  if (mode === "referral_only") {
    return { allowPublicSignup: false, mode };
  }

  return { allowPublicSignup: true, mode: "open" };
}

export async function getSignupPolicy(): Promise<SignupPolicy> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SIGNUP_POLICY_SETTING_KEY)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return parseSignupPolicy(data?.value);
}

export async function isValidReferralCode(code: string): Promise<boolean> {
  const referralInvite = await getReferralInviteByCode(code);

  return Boolean(referralInvite);
}

export async function getReferralInviteByCode(code: string): Promise<ReferralInvite | null> {
  const normalizedCode = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]{4,40}$/.test(normalizedCode)) {
    return null;
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;

  try {
    supabase = createSupabaseAdminClient();
  } catch {
    supabase = await createSupabaseServerClient();
  }

  const { data: buyerCode, error: buyerCodeError } = await supabase
    .from("referral_codes")
    .select("id,buyer_id,code")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (buyerCodeError) {
    throw new Error(buyerCodeError.message);
  }

  if (buyerCode) {
    return {
      buyerId: buyerCode.buyer_id,
      code: buyerCode.code,
      id: buyerCode.id,
      source: "buyer",
      targetMemberType: "buyer",
    };
  }

  const { data: memberCode, error: memberCodeError } = await supabase
    .from("member_referral_codes")
    .select("id,owner_profile_id,code,target_member_type")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (memberCodeError) {
    throw new Error(memberCodeError.message);
  }

  if (!memberCode) {
    return null;
  }

  return {
    code: memberCode.code,
    id: memberCode.id,
    ownerProfileId: memberCode.owner_profile_id,
    source: "member",
    targetMemberType: memberCode.target_member_type,
  };
}
