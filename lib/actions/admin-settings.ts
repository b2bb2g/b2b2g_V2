"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminLog } from "@/lib/audit/logs";
import { requireAdminRoute } from "@/lib/auth/guards";
import {
  SIGNUP_POLICY_SETTING_KEY,
  type SignupPolicy,
} from "@/lib/queries/signup-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSignupPolicyFromForm(formData: FormData): SignupPolicy {
  const allowPublicSignup = formData.get("allowPublicSignup") === "true";

  return {
    allowPublicSignup,
    mode: allowPublicSignup ? "open" : "referral_only",
  };
}

export async function updateSignupPolicyAction(formData: FormData): Promise<void> {
  const user = await requireAdminRoute();
  const supabase = await createSupabaseServerClient();
  const policy = getSignupPolicyFromForm(formData);

  const { data: before } = await supabase
    .from("site_settings")
    .select("id,value")
    .eq("key", SIGNUP_POLICY_SETTING_KEY)
    .maybeSingle();

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(
      {
        description:
          "Controls whether public signup is open or limited to users with referral links.",
        is_active: true,
        is_public: true,
        key: SIGNUP_POLICY_SETTING_KEY,
        updated_by: user.id,
        value: policy,
      },
      { onConflict: "key" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await writeAdminLog(supabase, {
    action: "setting_change",
    actorProfileId: user.id,
    afterData: policy,
    beforeData: before?.value ?? null,
    targetId: data.id,
    targetLabel: SIGNUP_POLICY_SETTING_KEY,
    targetTable: "site_settings",
  });

  revalidatePath("/admin");
  revalidatePath("/signup");
  redirect(`/admin?signupPolicy=${policy.mode}`);
}
