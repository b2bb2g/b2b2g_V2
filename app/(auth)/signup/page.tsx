import type { Metadata } from "next";
import Link from "next/link";
import { PasswordField } from "@/components/auth/password-field";
import { BrandLogo } from "@/components/shared/brand-logo";
import { signUp } from "@/lib/actions/auth";
import { t } from "@/lib/i18n/translation";
import { getSignupPolicy } from "@/lib/queries/signup-policy";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("auth.signup.title"),
};

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;

  if (!code) {
    return null;
  }

  return t(`auth.error.${code}`);
}

function getReferralCode(searchParams: Record<string, string | string[] | undefined>): string {
  const value =
    searchParams.referralCode ??
    searchParams.referral ??
    searchParams.ref ??
    searchParams.invite ??
    searchParams.code;

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const referralCode = getReferralCode(resolvedSearchParams).trim().toUpperCase();
  const signupPolicy = await getSignupPolicy();

  return (
    <section className="grid w-full overflow-hidden rounded-[18px] border border-calm-hairline bg-canvas lg:grid-cols-[0.85fr_1.15fr]">
      <div className="flex flex-col bg-surface-tile-1 p-8 sm:p-10">
        <Link aria-label={t("brand.name")} className="shrink-0" href="/">
          <BrandLogo className="h-[86px] w-[130px]" priority variant="full" />
        </Link>
        <div className="mt-16 max-w-md sm:mt-20">
          <p className="type-caption-strong text-white/60">{t("auth.signup.eyebrow")}</p>
          <h1 className="type-display-lg mt-4 text-white">{t("auth.signup.heroTitle")}</h1>
          <p className="type-body mt-5 text-white/70">{t("auth.signup.heroDescription")}</p>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-md">
          <h2 className="type-display-md text-calm-ink">{t("auth.signup.title")}</h2>
          <p className="type-body mt-2 text-calm-ink-muted-80">{t("auth.signup.description")}</p>

          <div className="mt-5 rounded-[12px] border border-calm-hairline bg-canvas-parchment px-4 py-3">
            <p className="type-caption-strong text-calm-ink">
              {signupPolicy.allowPublicSignup
                ? t("auth.signup.policy.openTitle")
                : t("auth.signup.policy.referralTitle")}
            </p>
            <p className="type-caption mt-1 text-calm-ink-muted-48">
              {signupPolicy.allowPublicSignup
                ? t("auth.signup.policy.openDescription")
                : referralCode
                  ? t("auth.signup.policy.referralDetected")
                  : t("auth.signup.policy.referralRequired")}
            </p>
          </div>

          {errorMessage ? (
            <p className="type-caption-strong mt-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <form action={signUp} className="mt-8 space-y-5">
            <input name="referralCode" type="hidden" value={referralCode} />
            <div>
              <label className="type-caption-strong text-calm-ink" htmlFor="signup-email">
                {t("auth.email")}
              </label>
              <input
                autoComplete="email"
                className="type-body mt-2 min-h-11 w-full rounded-[8px] border border-calm-hairline bg-white px-4 text-calm-ink outline-none focus:border-action-blue"
                id="signup-email"
                name="email"
                placeholder={t("auth.email.placeholder")}
                required
                type="email"
              />
            </div>

            <PasswordField
              autoComplete="new-password"
              id="signup-password"
              labelKey="auth.password"
              name="password"
              placeholderKey="auth.password.placeholder"
            />
            <PasswordField
              autoComplete="new-password"
              id="signup-confirm-password"
              labelKey="auth.confirmPassword"
              name="confirmPassword"
              placeholderKey="auth.confirmPassword.placeholder"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link className="type-button-utility text-action-blue" href="/login">
                {t("auth.signup.haveAccount")}
              </Link>
              <button className="pill-primary w-full sm:w-auto" type="submit">
                {t("auth.signup.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
