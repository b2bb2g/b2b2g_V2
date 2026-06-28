import type { Metadata } from "next";
import { DashboardProductsPage as DashboardProductsView } from "@/components/dashboard/dashboard-pages";
import { t } from "@/lib/i18n/translation";
import { getDashboardProductsData } from "@/lib/queries/dashboard";

export const metadata: Metadata = {
  title: t("dashboard.products.title"),
};

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const data = await getDashboardProductsData();
  const result = typeof params?.result === "string" ? params.result : null;
  const error = typeof params?.error === "string" ? params.error : null;
  const noticeMessage =
    result === "created"
      ? t("dashboard.products.result.created")
      : result === "showcase_created"
        ? t("dashboard.products.result.showcase_created")
        : result === "showcase_submitted"
          ? t("dashboard.products.result.showcase_submitted")
          : null;
  const errorMessage =
    error === "create_failed"
      ? t("dashboard.products.error.create_failed")
      : error === "showcase_create_failed"
        ? t("dashboard.products.error.showcase_create_failed")
        : error === "showcase_submit_failed"
          ? t("dashboard.products.error.showcase_submit_failed")
          : null;

  return (
    <DashboardProductsView
      data={data}
      errorMessage={errorMessage}
      noticeMessage={noticeMessage}
    />
  );
}
