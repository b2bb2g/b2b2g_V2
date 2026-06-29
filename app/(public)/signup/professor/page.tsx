import type { Metadata } from "next";
import {
  ProfessorSignupForm,
  type ProfessorInvitationSubmitState,
} from "@/components/public/professor-signup-form";
import { SignupStartCard } from "@/components/public/signup-start-card";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/translation";
import { validateInvitationTokenForPublic } from "@/lib/invitations/actions";
import type { PublicInvitationValidationResult } from "@/lib/invitations/types";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type SignupStartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/signup/professor",
  description: t("signupStart.professor.metaDescription"),
  title: t("signupStart.professor.title"),
});

function getInvitationToken(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.invitation_token;
  const token = Array.isArray(value) ? value[0] : value;

  return token?.trim() || null;
}

function getProfessorInvitationSubmitState(
  invitationToken: string | null,
  validation: PublicInvitationValidationResult,
): ProfessorInvitationSubmitState {
  if (!invitationToken) {
    return "missing";
  }

  if (!validation.validationAvailable) {
    return "unavailable";
  }

  if (!validation.ok) {
    return "invalid";
  }

  if (
    validation.invitationType !== "professor_admin_invite" ||
    validation.targetRoleKey.trim().toLowerCase() !== "professor"
  ) {
    return "wrong_type";
  }

  return "valid_admin_invite";
}

export default async function ProfessorSignupStartPage({
  searchParams,
}: Readonly<SignupStartPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const invitationToken = getInvitationToken(resolvedSearchParams);
  const [user, invitationValidation] = await Promise.all([
    getCurrentUser(),
    validateInvitationTokenForPublic(invitationToken),
  ]);
  const invitationState = getProfessorInvitationSubmitState(
    invitationToken,
    invitationValidation,
  );

  return (
    <SignupStartCard
      hasInvitationToken={Boolean(invitationToken)}
      role="professor"
    >
      <ProfessorSignupForm
        invitationState={invitationState}
        invitationToken={invitationToken}
        isAuthenticated={Boolean(user)}
      />
    </SignupStartCard>
  );
}
