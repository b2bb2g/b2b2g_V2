import type { ReactNode } from "react";
import { SiteShell } from "@/components/shared/site-shell";
import { requireAdminRoute } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireAdminRoute();

  return (
    <SiteShell adminEmail={user.email ?? null} variant="admin">
      {children}
    </SiteShell>
  );
}
