import type { Metadata } from "next";
import { DashboardAccountPage } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardAccountData } from "@/lib/queries/dashboard";

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: t("dashboard.account.title"),
};

function getErrorMessage(errorCode: string | string[] | undefined): string | null {
  const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;

  if (!code) {
    return null;
  }

  return t(`dashboard.account.error.${code}`);
}

function getNoticeMessage(noticeCode: string | string[] | undefined): string | null {
  const code = Array.isArray(noticeCode) ? noticeCode[0] : noticeCode;

  if (code === "update_success") {
    return t("dashboard.account.notice.updateSuccess");
  }

  return null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const data = await getDashboardAccountData();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const noticeMessage = getNoticeMessage(resolvedSearchParams.notice);

  return (
    <DashboardAccountPage data={data} errorMessage={errorMessage} noticeMessage={noticeMessage} />
  );
}
