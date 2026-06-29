"use server";

import { requestRole } from "@/lib/actions/identity";
import { validateInvitationTokenForPublic } from "@/lib/invitations/actions";

export type ProfessorSignupSubmitState = {
  error: string | null;
  ok: boolean;
  recordId: string | null;
};

const MAX_FIELD_LENGTH = 160;
const MAX_SUMMARY_LENGTH = 600;
const initialState: ProfessorSignupSubmitState = {
  error: null,
  ok: false,
  recordId: null,
};

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function requireFormString(
  formData: FormData,
  key: string,
  label: string,
  maxLength = MAX_FIELD_LENGTH,
): string {
  const value = getFormString(formData, key);

  if (!value) {
    throw new Error(`${label} is required`);
  }

  if (value.length > maxLength) {
    throw new Error(`${label} is too long`);
  }

  return value;
}

function assertTermsAccepted(formData: FormData) {
  if (getFormString(formData, "terms_agreed") !== "yes") {
    throw new Error("Terms agreement is required");
  }
}

async function assertProfessorInvitation(formData: FormData): Promise<void> {
  const invitationToken = getFormString(formData, "invitation_token");

  if (!invitationToken) {
    throw new Error("Professor onboarding requires Admin Invitation");
  }

  const validation = await validateInvitationTokenForPublic(invitationToken);

  if (!validation.ok) {
    throw new Error("Professor invitation is invalid or expired");
  }

  if (
    validation.invitationType !== "professor_admin_invite" ||
    validation.targetRoleKey.trim().toLowerCase() !== "professor"
  ) {
    throw new Error("Invitation is not valid for Professor onboarding");
  }
}

async function buildProfessorApplicationReason(formData: FormData): Promise<string> {
  assertTermsAccepted(formData);
  await assertProfessorInvitation(formData);

  requireFormString(formData, "contact_email", "Contact email", 320);
  requireFormString(formData, "professor_name", "Professor name");

  const university = requireFormString(formData, "university", "University");
  const department = requireFormString(formData, "department", "Department");
  const position = requireFormString(formData, "position_title", "Position / Title");
  const programSummary = requireFormString(
    formData,
    "program_or_course_summary",
    "Program or course summary",
    MAX_SUMMARY_LENGTH,
  );
  const expectedStudentCount = requireFormString(
    formData,
    "expected_student_count",
    "Expected student count",
  );

  return [
    "Professor application",
    `University: ${university}`,
    `Department: ${department}`,
    `Position: ${position}`,
    `Program summary: ${programSummary}`,
    `Expected student count: ${expectedStudentCount}`,
    "Invitation: provided",
  ].join("\n");
}

export async function submitProfessorRoleApplication(
  _previousState: ProfessorSignupSubmitState,
  formData: FormData,
): Promise<ProfessorSignupSubmitState> {
  try {
    const reason = await buildProfessorApplicationReason(formData);
    const result = await requestRole("professor", reason);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      error: null,
      ok: true,
      recordId: result.recordId,
    };
  } catch (error) {
    return {
      ...initialState,
      error:
        error instanceof Error ? error.message : "Professor application failed",
    };
  }
}
