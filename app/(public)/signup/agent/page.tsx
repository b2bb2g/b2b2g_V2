import type { Metadata } from "next";
import { AgentSignupForm } from "@/components/public/agent-signup-form";
import { SignupStartCard } from "@/components/public/signup-start-card";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/translation";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type SignupStartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/signup/agent",
  description: t("signupStart.agent.metaDescription"),
  title: t("signupStart.agent.title"),
});

function getInvitationToken(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.invitation_token;
  const token = Array.isArray(value) ? value[0] : value;

  return token?.trim() || null;
}

export default async function AgentSignupStartPage({
  searchParams,
}: Readonly<SignupStartPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const invitationToken = getInvitationToken(resolvedSearchParams);
  const user = await getCurrentUser();

  return (
    <SignupStartCard
      hasInvitationToken={Boolean(invitationToken)}
      role="agent"
    >
      <AgentSignupForm
        invitationToken={invitationToken}
        isAuthenticated={Boolean(user)}
      />
    </SignupStartCard>
  );
}
