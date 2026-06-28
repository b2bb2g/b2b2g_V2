import type { Metadata } from "next";
import { DashboardCompanyPage as DashboardCompanyView } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardCompanyData } from "@/lib/queries/dashboard";

export const metadata: Metadata = {
  title: t("dashboard.company.title"),
};

type DashboardCompanyRouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}

function getNoticeMessage(resultCode: string | undefined) {
  if (resultCode === "updated") {
    return t("dashboard.company.result.updated");
  }

  return null;
}

function getErrorMessage(errorCode: string | undefined) {
  if (!errorCode) {
    return null;
  }

  return t(`dashboard.company.error.${errorCode}`);
}

export default async function DashboardCompanyPage({ searchParams }: DashboardCompanyRouteProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getDashboardCompanyData();
  const noticeMessage = getNoticeMessage(getParam(resolvedSearchParams, "result"));
  const errorMessage = getErrorMessage(getParam(resolvedSearchParams, "error"));

  return (
    <DashboardCompanyView data={data} errorMessage={errorMessage} noticeMessage={noticeMessage} />
  );
}
