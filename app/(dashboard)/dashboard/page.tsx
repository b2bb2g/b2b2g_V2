import type { Metadata } from "next";
import { DashboardOverviewPage } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardOverviewData } from "@/lib/queries/dashboard";

export const metadata: Metadata = {
  title: t("dashboard.overview.title"),
};

export default async function DashboardPage() {
  const data = await getDashboardOverviewData();

  return <DashboardOverviewPage data={data} />;
}
