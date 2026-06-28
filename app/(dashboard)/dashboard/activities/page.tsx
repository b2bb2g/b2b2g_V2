import type { Metadata } from "next";
import { DashboardActivitiesPage as DashboardActivitiesScreen } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardActivitiesData } from "@/lib/queries/dashboard";

export const metadata: Metadata = {
  title: t("dashboard.activities.title"),
};

export default async function DashboardActivitiesPage() {
  const data = await getDashboardActivitiesData();

  return <DashboardActivitiesScreen data={data} />;
}
