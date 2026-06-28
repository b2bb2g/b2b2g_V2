import type { ReactNode } from "react";
import { SiteShell } from "@/components/shared/site-shell";
import { requireDashboardRoute } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await requireDashboardRoute();

  return (
    <SiteShell dashboardContext={context} variant="dashboard">
      {children}
    </SiteShell>
  );
}
