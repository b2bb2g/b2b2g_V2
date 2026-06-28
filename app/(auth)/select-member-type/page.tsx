import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { selectMemberType } from "@/lib/actions/auth";
import { requireAuthenticatedRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { getReferralInviteByCode } from "@/lib/queries/signup-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SelectMemberTypePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const memberTypeOptions = [
  { descriptionKey: "auth.memberType.supplier.description", labelKey: "auth.member.supplier", value: "supplier" },
  { descriptionKey: "auth.memberType.buyer.description", labelKey: "auth.member.buyer", value: "buyer" },
  { descriptionKey: "auth.memberType.agent.description", labelKey: "auth.member.agent", value: "agent" },
  { descriptionKey: "auth.memberType.professor.description", labelKey: "auth.member.professor", value: "professor" },
  { descriptionKey: "auth.memberType.student.description", labelKey: "auth.member.student", value: "student" },
] as const;

export const metadata: Metadata = {
  title: t("auth.selectMemberType.title"),
};

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;

  if (!code) {
    return null;
  }

  return t(`auth.error.${code}`);
}

function getUserReferralCode(userMetadata: Record<string, unknown> | null | undefined): string {
  const referralCode = userMetadata?.referral_code;

  return typeof referralCode === "string" ? referralCode.trim().toUpperCase() : "";
}

export default async function SelectMemberTypePage({ searchParams }: SelectMemberTypePageProps) {
  const user = await requireAuthenticatedRoute();
  const supabase = await createSupabaseServerClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const referralCode = getUserReferralCode(user.user_metadata);
  const referralInvite = referralCode ? await getReferralInviteByCode(referralCode) : null;
  const visibleMemberTypeOptions = referralInvite
    ? memberTypeOptions.filter((option) => option.value === referralInvite.targetMemberType)
    : memberTypeOptions;

  return (
    <section className="w-full overflow-hidden rounded-[18px] border border-calm-hairline bg-canvas p-6 sm:p-10">
      <p className="type-caption-strong text-action-blue">{t("auth.selectMemberType.eyebrow")}</p>
      <h1 className="type-display-md mt-2 text-calm-ink">{t("auth.selectMemberType.title")}</h1>
      <p className="type-body mt-2 max-w-2xl text-calm-ink-muted-80">
        {t("auth.selectMemberType.description")}
      </p>

      {errorMessage ? (
        <p className="type-caption-strong mt-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {referralInvite ? (
        <div className="mt-5 rounded-[12px] border border-action-blue/20 bg-action-blue/10 px-4 py-3">
          <p className="type-caption-strong text-action-blue">
            {t("auth.selectMemberType.inviteLockedTitle")}
          </p>
          <p className="type-caption mt-1 text-calm-ink-muted-64">
            {t("auth.selectMemberType.inviteLockedDescription")}
          </p>
        </div>
      ) : null}

      <form action={selectMemberType} className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMemberTypeOptions.map((option, index) => (
            <label className="block cursor-pointer" key={option.value}>
              <input
                className="peer sr-only"
                defaultChecked={index === 0}
                name="memberType"
                required
                type="radio"
                value={option.value}
              />
              <div className="flex h-full flex-col rounded-[18px] border border-calm-hairline bg-canvas p-6 transition peer-checked:border-action-blue peer-checked:bg-canvas-parchment">
                <p className="type-body-strong text-calm-ink">{t(option.labelKey)}</p>
                <p className="type-caption mt-2 text-calm-ink-muted-48">
                  {t(option.descriptionKey)}
                </p>
              </div>
            </label>
          ))}
        </div>

        <button className="pill-primary mt-8 w-full sm:w-auto" type="submit">
          {t("auth.selectMemberType.submit")}
        </button>
      </form>
    </section>
  );
}
