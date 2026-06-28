"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuthenticatedRoute } from "@/lib/auth/guards";
import { pendingApprovalPath, selectMemberTypePath, signInPath } from "@/lib/constants/routes";
import { getReferralInviteByCode, getSignupPolicy } from "@/lib/queries/signup-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MemberTypeCode } from "@/types/database";

const SIGNUP_MEMBER_TYPES = [
  "supplier",
  "buyer",
  "agent",
  "professor",
  "student",
] as const satisfies readonly Exclude<MemberTypeCode, "administrator">[];

type SignUpMemberType = (typeof SIGNUP_MEMBER_TYPES)[number];

const AUTO_LOGIN_COOKIE = "b2bb2g_auto_login";
const AUTO_LOGIN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isCheckedFormValue(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

async function setAutoLoginPreference(isEnabled: boolean): Promise<void> {
  const cookieStore = await cookies();

  if (isEnabled) {
    cookieStore.set(AUTO_LOGIN_COOKIE, "on", {
      httpOnly: true,
      maxAge: AUTO_LOGIN_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return;
  }

  cookieStore.set(AUTO_LOGIN_COOKIE, "off", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function isSignUpMemberType(value: string): value is SignUpMemberType {
  return SIGNUP_MEMBER_TYPES.some((memberType) => memberType === value);
}

function redirectWithError(
  path: "/login" | "/signup" | typeof selectMemberTypePath,
  errorCode: string,
): never {
  redirect(`${path}?error=${errorCode}`);
}

function getUserReferralCode(userMetadata: Record<string, unknown> | null | undefined): string {
  const referralCode = userMetadata?.referral_code;

  return typeof referralCode === "string" ? referralCode.trim().toUpperCase() : "";
}

function logInviteTrackingError(error: unknown): void {
  console.error("Failed to track referral invite", error);
}

export async function signUp(formData: FormData): Promise<never> {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");
  const referralCode = getFormString(formData, "referralCode").toUpperCase();

  if (!email || !password || !confirmPassword) {
    redirectWithError("/signup", "missing_fields");
  }

  if (password !== confirmPassword) {
    redirectWithError("/signup", "password_mismatch");
  }

  if (password.length < 8) {
    redirectWithError("/signup", "weak_password");
  }

  const signupPolicy = await getSignupPolicy();
  const referralInvite = referralCode ? await getReferralInviteByCode(referralCode) : null;

  if (!signupPolicy.allowPublicSignup) {
    if (!referralCode) {
      redirectWithError("/signup", "referral_required");
    }

    if (!referralInvite) {
      redirectWithError("/signup", "invalid_referral");
    }
  } else if (referralCode && !referralInvite) {
    redirectWithError("/signup", "invalid_referral");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    options: referralInvite
      ? {
          data: {
            referral_code: referralInvite.code,
            referral_source: referralInvite.source,
            referral_target_member_type: referralInvite.targetMemberType,
          },
        }
      : undefined,
    password,
  });

  if (error) {
    redirectWithError("/signup", "signup_failed");
  }

  redirect(`${signInPath}?notice=signup_success`);
}

export async function signIn(formData: FormData): Promise<never> {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const rememberSession = isCheckedFormValue(formData.get("rememberSession"));

  if (!email || !password) {
    redirectWithError("/login", "missing_fields");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithError("/login", "invalid_credentials");
  }

  await setAutoLoginPreference(rememberSession);

  redirect("/dashboard");
}

export async function signOut(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/");
}

export async function selectMemberType(formData: FormData): Promise<never> {
  const user = await requireAuthenticatedRoute();
  const memberType = getFormString(formData, "memberType");
  const referralCode = getUserReferralCode(user.user_metadata);
  const referralInvite = referralCode ? await getReferralInviteByCode(referralCode) : null;

  if (!isSignUpMemberType(memberType)) {
    redirectWithError(selectMemberTypePath, "invalid_member_type");
  }

  if (referralInvite && memberType !== referralInvite.targetMemberType) {
    redirectWithError(selectMemberTypePath, "invite_member_type_mismatch");
  }

  const supabase = await createSupabaseServerClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/dashboard");
  }

  const { data: memberTypeRow, error: memberTypeError } = await supabase
    .from("member_types")
    .select("id")
    .eq("code", memberType)
    .single();

  if (memberTypeError || !memberTypeRow) {
    redirectWithError(selectMemberTypePath, "invalid_member_type");
  }

  let careerRankId: string | null = null;

  if (memberType === "student") {
    const { data: careerRank } = await supabase
      .from("career_ranks")
      .select("id")
      .eq("code", "global_trade_ambassador")
      .maybeSingle();

    careerRankId = careerRank?.id ?? null;
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    career_rank_id: careerRankId,
    display_name: null,
    email: user.email ?? "",
    id: user.id,
    member_type_id: memberTypeRow.id,
  });

  if (profileError) {
    redirectWithError(selectMemberTypePath, "profile_creation_failed");
  }

  let childRoleId: string | null = null;

  if (memberType === "buyer") {
    const { data: childRow, error: childError } = await supabase
      .from("buyers")
      .insert({ profile_id: user.id })
      .select("id")
      .single();

    if (childError) {
      redirectWithError(selectMemberTypePath, "profile_creation_failed");
    }

    childRoleId = childRow.id;
  } else if (memberType === "agent") {
    const { data: childRow, error: childError } = await supabase
      .from("agents")
      .insert({ profile_id: user.id })
      .select("id")
      .single();

    if (childError) {
      redirectWithError(selectMemberTypePath, "profile_creation_failed");
    }

    childRoleId = childRow.id;
  } else if (memberType === "professor") {
    const { data: childRow, error: childError } = await supabase
      .from("professors")
      .insert({ profile_id: user.id })
      .select("id")
      .single();

    if (childError) {
      redirectWithError(selectMemberTypePath, "profile_creation_failed");
    }

    childRoleId = childRow.id;
  } else if (memberType === "student") {
    let professorId: string | null = null;

    if (referralInvite?.source === "member" && referralInvite.targetMemberType === "student") {
      try {
        const adminSupabase = createSupabaseAdminClient();
        const { data: professor } = await adminSupabase
          .from("professors")
          .select("id")
          .eq("profile_id", referralInvite.ownerProfileId)
          .maybeSingle();

        professorId = professor?.id ?? null;
      } catch (error) {
        logInviteTrackingError(error);
      }
    }

    const { data: childRow, error: childError } = await supabase
      .from("students")
      .insert({ professor_id: professorId, profile_id: user.id })
      .select("id")
      .single();

    if (childError) {
      redirectWithError(selectMemberTypePath, "profile_creation_failed");
    }

    childRoleId = childRow.id;
  }

  if (referralInvite) {
    try {
      const adminSupabase = createSupabaseAdminClient();

      if (referralInvite.source === "buyer" && memberType === "buyer" && childRoleId) {
        const { error: relationError } = await adminSupabase.from("referral_relations").upsert(
          {
            child_buyer_id: childRoleId,
            parent_buyer_id: referralInvite.buyerId,
            referral_code_id: referralInvite.id,
            reward_status: "pending",
            status: "active",
            updated_by: user.id,
          },
          { onConflict: "child_buyer_id" },
        );

        if (relationError) {
          logInviteTrackingError(relationError);
        }
      }

      if (referralInvite.source === "member") {
        const { error: signupError } = await adminSupabase.from("member_referral_signups").upsert(
          {
            owner_profile_id: referralInvite.ownerProfileId,
            referral_code_id: referralInvite.id,
            referred_profile_id: user.id,
            status: "active",
            updated_by: user.id,
          },
          { onConflict: "referred_profile_id" },
        );

        if (signupError) {
          logInviteTrackingError(signupError);
        }
      }
    } catch (error) {
      logInviteTrackingError(error);
    }
  }

  redirect(pendingApprovalPath);
}
