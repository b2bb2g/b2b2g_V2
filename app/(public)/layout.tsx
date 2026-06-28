import type { ReactNode } from "react";
import { SiteShell } from "@/components/shared/site-shell";
import { getPublicHeaderUserContext } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const publicUser = await getPublicHeaderUserContext();

  return (
    <SiteShell publicUser={publicUser} variant="public">
      {children}
    </SiteShell>
  );
}
