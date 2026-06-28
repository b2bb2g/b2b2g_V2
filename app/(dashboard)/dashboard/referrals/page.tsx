import type { Metadata } from "next";
import { DashboardReferralPage } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardReferralsData } from "@/lib/queries/dashboard";

type ReferralsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("dashboard.referrals.title"),
};

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;

  if (!code) {
    return null;
  }

  return t(`dashboard.referrals.error.${code}`);
}

function getNoticeMessage(noticeCode: string | string[] | undefined): string | null {
  const code = Array.isArray(noticeCode) ? noticeCode[0] : noticeCode;

  if (code === "code_ready") {
    return t("dashboard.referrals.notice.codeReady");
  }

  return null;
}

export default async function DashboardReferralsPage({ searchParams }: ReferralsPageProps) {
  const data = await getDashboardReferralsData();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const noticeMessage = getNoticeMessage(resolvedSearchParams.notice);

  return (
    <DashboardReferralPage
      data={data}
      errorMessage={errorMessage}
      noticeMessage={noticeMessage}
    />
  );
}
