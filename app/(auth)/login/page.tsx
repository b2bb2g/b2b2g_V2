import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/shared/brand-logo";
import { t } from "@/lib/i18n/translation";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("auth.login.title"),
};

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;

  if (!code) {
    return null;
  }

  return t(`auth.error.${code}`);
}

function getNoticeMessage(noticeCode: string | string[] | undefined): string | null {
  const code = Array.isArray(noticeCode) ? noticeCode[0] : noticeCode;

  if (code === "signup_success") {
    return t("auth.login.notice.signupSuccess");
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const noticeMessage = getNoticeMessage(resolvedSearchParams.notice);

  return (
    <section className="grid w-full overflow-hidden rounded-[18px] border border-calm-hairline bg-canvas lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex flex-col bg-surface-tile-1 p-8 sm:p-10">
        <Link aria-label={t("brand.name")} className="shrink-0" href="/">
          <BrandLogo className="h-[86px] w-[130px]" priority variant="full" />
        </Link>
        <div className="mt-16 max-w-md sm:mt-20">
          <p className="type-caption-strong text-white/60">{t("auth.login.eyebrow")}</p>
          <h1 className="type-display-lg mt-4 text-white">{t("auth.login.heroTitle")}</h1>
          <p className="type-body mt-5 text-white/70">{t("auth.login.heroDescription")}</p>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-md">
          <h2 className="type-display-md text-calm-ink">{t("auth.login.title")}</h2>
          <p className="type-body mt-2 text-calm-ink-muted-80">{t("auth.login.description")}</p>

          {noticeMessage ? (
            <p className="type-caption-strong mt-5 rounded-[8px] border border-calm-hairline bg-canvas-parchment px-4 py-3 text-calm-ink">
              {noticeMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="type-caption-strong mt-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <LoginForm />
        </div>
      </div>
    </section>
  );
}
