import type { Metadata } from "next";
import { InvitationAcceptCard } from "@/components/public/invitation-accept-card";
import { validateInvitationTokenForPublic } from "@/lib/invitations/actions";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type InvitationAcceptPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/signup/invitation",
  description: t("invitation.accept.metaDescription"),
  title: t("invitation.accept.title"),
});

function getSingleSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function InvitationAcceptPage({
  searchParams,
}: Readonly<InvitationAcceptPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const token = getSingleSearchParam(resolvedSearchParams.invitation_token);
  const validation = await validateInvitationTokenForPublic(token);

  return <InvitationAcceptCard validation={validation} />;
}
