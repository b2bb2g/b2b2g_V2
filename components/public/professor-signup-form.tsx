"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  submitProfessorRoleApplication,
  type ProfessorSignupSubmitState,
} from "@/lib/actions/professor-signup";
import { t } from "@/lib/i18n/translation";

export type ProfessorInvitationSubmitState =
  | "invalid"
  | "missing"
  | "unavailable"
  | "valid_admin_invite"
  | "wrong_type";

type ProfessorSignupFormProps = {
  invitationState: ProfessorInvitationSubmitState;
  invitationToken?: string | null;
  isAuthenticated: boolean;
};

const initialSubmitState: ProfessorSignupSubmitState = {
  error: null,
  ok: false,
  recordId: null,
};

const expectedStudentCountOptions = [
  "professorSignup.studentCount.placeholder",
  "professorSignup.studentCount.under10",
  "professorSignup.studentCount.10to30",
  "professorSignup.studentCount.31to60",
  "professorSignup.studentCount.over60",
];

function FieldLabel({
  children,
  htmlFor,
}: Readonly<{
  children: string;
  htmlFor: string;
}>) {
  return (
    <label className="type-caption-strong text-calm-ink" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function ProfessorSignupForm({
  invitationState,
  invitationToken,
  isAuthenticated,
}: Readonly<ProfessorSignupFormProps>) {
  const trimmedToken = invitationToken?.trim();
  const [state, formAction, isPending] = useActionState(
    submitProfessorRoleApplication,
    initialSubmitState,
  );
  const isSubmitted = state.ok;
  const hasValidInvitation = invitationState === "valid_admin_invite";
  const isSubmitDisabled =
    !isAuthenticated || !hasValidInvitation || isPending || isSubmitted;
  const invitationNoticeKey = hasValidInvitation
    ? "professorSignup.invitation.validDescription"
    : invitationState === "missing"
      ? "professorSignup.invitation.requiredDescription"
      : invitationState === "unavailable"
        ? "professorSignup.invitation.unavailableDescription"
        : invitationState === "wrong_type"
          ? "professorSignup.invitation.wrongTypeDescription"
          : "professorSignup.invitation.invalidDescription";

  return (
    <section className="bg-canvas pb-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            action={formAction}
            className="rounded-2xl border border-calm-hairline bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.06)]"
          >
            {trimmedToken ? (
              <input name="invitation_token" type="hidden" value={trimmedToken} />
            ) : null}

            <div>
              <p className="type-caption-strong text-action-blue">
                {t("professorSignup.form.eyebrow")}
              </p>
              <h2 className="type-heading-md mt-2 text-calm-ink">
                {t("professorSignup.form.title")}
              </h2>
              <p className="type-caption mt-3 max-w-2xl text-calm-ink-muted-80">
                {t("professorSignup.form.description")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-status-warning/20 bg-status-warning-bg p-4">
              <p className="type-caption-strong text-calm-ink">
                {t("professorSignup.publicOff.title")}
              </p>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t("professorSignup.publicOff.description")}
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-2xl border border-action-blue/20 bg-action-blue/5 p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("professorSignup.auth.requiredTitle")}
                </p>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t("professorSignup.auth.requiredDescription")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link className="pill-primary min-h-10" href="/login">
                    {t("professorSignup.auth.signIn")}
                  </Link>
                  <Link className="pill-secondary min-h-10" href="/signup">
                    {t("professorSignup.auth.createAccount")}
                  </Link>
                </div>
              </div>
            ) : null}

            {isAuthenticated ? (
              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  hasValidInvitation
                    ? "border-status-positive/20 bg-status-positive-bg"
                    : "border-status-warning/20 bg-status-warning-bg"
                }`}
              >
                <p className="type-caption-strong text-calm-ink">
                  {t(
                    hasValidInvitation
                      ? "professorSignup.invitation.validTitle"
                      : "professorSignup.invitation.requiredTitle",
                  )}
                </p>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t(invitationNoticeKey)}
                </p>
              </div>
            ) : null}

            {state.ok ? (
              <div className="mt-6 rounded-2xl border border-status-positive/20 bg-status-positive-bg p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("professorSignup.success.title")}
                </p>
                <ul className="mt-3 space-y-2 type-caption text-calm-ink-muted-80">
                  <li>{t("professorSignup.success.adminApproval")}</li>
                  <li>{t("professorSignup.success.studentInvites")}</li>
                </ul>
              </div>
            ) : null}

            {state.error ? (
              <div className="mt-6 rounded-2xl border border-status-negative/20 bg-status-negative-bg p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("professorSignup.error.title")}
                </p>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {state.error}
                </p>
              </div>
            ) : null}

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="professor-contact-email">
                  {t("professorSignup.field.contactEmail")}
                </FieldLabel>
                <input
                  autoComplete="email"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-contact-email"
                  name="contact_email"
                  placeholder={t("professorSignup.placeholder.contactEmail")}
                  required
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="professor-name">
                  {t("professorSignup.field.professorName")}
                </FieldLabel>
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-name"
                  name="professor_name"
                  placeholder={t("professorSignup.placeholder.professorName")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="professor-university">
                  {t("professorSignup.field.university")}
                </FieldLabel>
                <input
                  autoComplete="organization"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-university"
                  name="university"
                  placeholder={t("professorSignup.placeholder.university")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="professor-department">
                  {t("professorSignup.field.department")}
                </FieldLabel>
                <input
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-department"
                  name="department"
                  placeholder={t("professorSignup.placeholder.department")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="professor-position">
                  {t("professorSignup.field.position")}
                </FieldLabel>
                <input
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-position"
                  name="position_title"
                  placeholder={t("professorSignup.placeholder.position")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="professor-program-summary">
                  {t("professorSignup.field.programSummary")}
                </FieldLabel>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-program-summary"
                  name="program_or_course_summary"
                  placeholder={t("professorSignup.placeholder.programSummary")}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="professor-student-count">
                  {t("professorSignup.field.expectedStudentCount")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="professor-student-count"
                  name="expected_student_count"
                  required
                >
                  {expectedStudentCountOptions.map((key, index) => (
                    <option disabled={index === 0} key={key} value={index === 0 ? "" : t(key)}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-xl border border-calm-hairline bg-canvas-parchment p-4 type-caption text-calm-ink-muted-80">
              <input
                className="mt-1 size-4 rounded border-calm-hairline"
                name="terms_agreed"
                required
                type="checkbox"
                value="yes"
              />
              <span>{t("professorSignup.terms")}</span>
            </label>

            <button
              className={`pill-primary mt-6 min-h-11 w-full ${
                isSubmitDisabled ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitted
                ? t("professorSignup.submit.submitted")
                : isPending
                  ? t("professorSignup.submit.pending")
                  : hasValidInvitation
                    ? t("professorSignup.submit.enabled")
                    : t("professorSignup.submit.disabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {isSubmitted
                ? t("professorSignup.submit.afterSubmitted")
                : !isAuthenticated
                  ? t("professorSignup.submit.authRequired")
                  : hasValidInvitation
                    ? t("professorSignup.submit.ready")
                    : t("professorSignup.submit.invitationRequired")}
            </p>
          </form>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("professorSignup.policy.title")}
              </p>
              <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
                <li>{t("professorSignup.policy.invitationBased")}</li>
                <li>{t("professorSignup.policy.publicOff")}</li>
                <li>{t("professorSignup.policy.approvalRequired")}</li>
                <li>{t("professorSignup.policy.studentInvites")}</li>
                <li>{t("professorSignup.policy.studentInfo")}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("professorSignup.security.title")}
              </p>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t(
                  trimmedToken
                    ? "professorSignup.security.invitationToken"
                    : "professorSignup.security.noPublicApplication",
                )}
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
