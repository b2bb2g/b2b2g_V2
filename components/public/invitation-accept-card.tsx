import Link from "next/link";
import type {
  InvitationType,
  PublicInvitationValidationResult,
} from "@/lib/invitations/types";
import { t } from "@/lib/i18n/translation";

type InvitationAcceptCardProps = {
  validation: PublicInvitationValidationResult;
};

type PublicInvitationRole = "agent" | "buyer" | "professor" | "student" | "supplier";

type RoleContent = {
  bodyKey: string;
  ctaKey: string;
  labelKey: string;
  titleKey: string;
};

const roleContent: Record<PublicInvitationRole, RoleContent> = {
  agent: {
    bodyKey: "invitation.accept.agentDescription",
    ctaKey: "invitation.accept.cta.agent",
    labelKey: "invitation.accept.role.agent",
    titleKey: "invitation.accept.agentTitle",
  },
  buyer: {
    bodyKey: "invitation.accept.buyerDescription",
    ctaKey: "invitation.accept.cta.buyer",
    labelKey: "invitation.accept.role.buyer",
    titleKey: "invitation.accept.buyerTitle",
  },
  professor: {
    bodyKey: "invitation.accept.professorDescription",
    ctaKey: "invitation.accept.cta.professor",
    labelKey: "invitation.accept.role.professor",
    titleKey: "invitation.accept.professorTitle",
  },
  student: {
    bodyKey: "invitation.accept.studentDescription",
    ctaKey: "invitation.accept.cta.student",
    labelKey: "invitation.accept.role.student",
    titleKey: "invitation.accept.studentTitle",
  },
  supplier: {
    bodyKey: "invitation.accept.supplierDescription",
    ctaKey: "invitation.accept.cta.supplier",
    labelKey: "invitation.accept.role.supplier",
    titleKey: "invitation.accept.supplierTitle",
  },
};

const invitationTypeRoleMap: Partial<Record<InvitationType, PublicInvitationRole>> = {
  agent_admin_invite: "agent",
  agent_public_application: "agent",
  buyer_agent_invite: "buyer",
  buyer_direct_signup: "buyer",
  professor_admin_invite: "professor",
  professor_public_application: "professor",
  student_professor_invite: "student",
  supplier_admin_invite: "supplier",
  supplier_public_signup: "supplier",
};

const processSteps = [
  {
    bodyKey: "invitation.accept.process.verify.body",
    titleKey: "invitation.accept.process.verify.title",
  },
  {
    bodyKey: "invitation.accept.process.signup.body",
    titleKey: "invitation.accept.process.signup.title",
  },
  {
    bodyKey: "invitation.accept.process.approval.body",
    titleKey: "invitation.accept.process.approval.title",
  },
] as const;

const faqItems = [
  {
    bodyKey: "invitation.accept.faq.account.body",
    titleKey: "invitation.accept.faq.account.title",
  },
  {
    bodyKey: "invitation.accept.faq.security.body",
    titleKey: "invitation.accept.faq.security.title",
  },
  {
    bodyKey: "invitation.accept.faq.help.body",
    titleKey: "invitation.accept.faq.help.title",
  },
] as const;

function getRoleFromValidation(
  validation: PublicInvitationValidationResult,
): PublicInvitationRole | null {
  if (!validation.ok) {
    return null;
  }

  const roleFromType = invitationTypeRoleMap[validation.invitationType];

  if (roleFromType) {
    return roleFromType;
  }

  const normalizedRole = validation.targetRoleKey.trim().toLowerCase();

  if (
    normalizedRole === "agent" ||
    normalizedRole === "buyer" ||
    normalizedRole === "professor" ||
    normalizedRole === "student" ||
    normalizedRole === "supplier"
  ) {
    return normalizedRole;
  }

  return null;
}

function getStatusDescriptionKey(validation: PublicInvitationValidationResult): string {
  if (validation.ok) {
    return "invitation.accept.validDescription";
  }

  if (validation.status === "expired") {
    return "invitation.accept.expiredDescription";
  }

  if (validation.status === "revoked") {
    return "invitation.accept.revokedDescription";
  }

  if (validation.status === "unavailable") {
    return "invitation.accept.validationUnavailableDescription";
  }

  return "invitation.accept.invalidDescription";
}

function getStatusLabelKey(validation: PublicInvitationValidationResult): string {
  if (validation.ok) {
    return "invitation.accept.status.valid";
  }

  if (validation.status === "expired") {
    return "invitation.accept.status.expired";
  }

  if (validation.status === "revoked") {
    return "invitation.accept.status.revoked";
  }

  if (validation.status === "unavailable") {
    return "invitation.accept.status.unavailable";
  }

  return "invitation.accept.status.invalid";
}

export function InvitationAcceptCard({
  validation,
}: Readonly<InvitationAcceptCardProps>) {
  const role = getRoleFromValidation(validation);
  const roleGuide = role ? roleContent[role] : null;
  const ctaKey = roleGuide?.ctaKey ?? "invitation.accept.cta.generic";
  const isValid = validation.ok && validation.status === "valid";

  return (
    <main className="bg-canvas">
      <section className="border-b border-calm-hairline bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">
              {t("invitation.accept.title")}
            </span>
          </nav>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div>
              <p className="type-caption-strong text-action-blue">
                {t("invitation.accept.eyebrow")}
              </p>
              <h1 className="type-display-lg mt-4 max-w-3xl text-calm-ink">
                {isValid
                  ? t("invitation.accept.validTitle")
                  : t("invitation.accept.unavailableTitle")}
              </h1>
              <p className="type-body mt-5 max-w-2xl text-calm-ink-muted-80">
                {t(getStatusDescriptionKey(validation))}
              </p>

              {roleGuide ? (
                <div className="mt-8 max-w-2xl border-l-4 border-action-blue bg-white px-5 py-4">
                  <p className="type-caption-strong text-action-blue">
                    {t(roleGuide.labelKey)}
                  </p>
                  <h2 className="type-heading-sm mt-2 text-calm-ink">
                    {t(roleGuide.titleKey)}
                  </h2>
                  <p className="type-caption mt-2 text-calm-ink-muted-80">
                    {t(roleGuide.bodyKey)}
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-calm-hairline bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.08)]">
              <div className="flex items-center justify-between gap-4">
                <p className="type-caption-strong text-calm-ink-muted-48">
                  {t("invitation.accept.validationResult")}
                </p>
                <span className="rounded-full border border-calm-hairline px-3 py-1 type-fine-print text-calm-ink-muted-80">
                  {t(getStatusLabelKey(validation))}
                </span>
              </div>

              {validation.ok ? (
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="type-fine-print text-calm-ink-muted-48">
                      {t("invitation.accept.field.role")}
                    </dt>
                    <dd className="mt-1 type-body-strong text-calm-ink">
                      {roleGuide
                        ? t(roleGuide.labelKey)
                        : validation.targetRoleKey}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-fine-print text-calm-ink-muted-48">
                      {t("invitation.accept.field.emailMatch")}
                    </dt>
                    <dd className="mt-1 type-body-strong text-calm-ink">
                      {validation.invitedEmailMatchRequired
                        ? t("invitation.accept.emailMatch.required")
                        : t("invitation.accept.emailMatch.notRequired")}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="type-caption mt-6 text-calm-ink-muted-80">
                  {t("invitation.accept.retryHelp")}
                </p>
              )}

              <div className="mt-8 space-y-3">
                <button
                  className="pill-primary min-h-11 w-full cursor-not-allowed opacity-60"
                  disabled
                  type="button"
                >
                  {t(ctaKey)}
                </button>
                <p className="type-caption text-center text-calm-ink-muted-48">
                  {t("invitation.accept.signupDisabledMeta")}
                </p>
                <Link className="pill-secondary min-h-11 w-full" href="/login">
                  {t("invitation.accept.signIn")}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="type-caption-strong text-action-blue">
                {t("invitation.accept.process.eyebrow")}
              </p>
              <h2 className="type-heading-lg mt-2 text-calm-ink">
                {t("invitation.accept.process.title")}
              </h2>
            </div>
            <p className="type-caption max-w-xl text-calm-ink-muted-80">
              {t("invitation.accept.process.description")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                className="rounded-2xl border border-calm-hairline bg-white p-5"
                key={step.titleKey}
              >
                <p className="type-fine-print text-action-blue">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="type-body-strong mt-3 text-calm-ink">
                  {t(step.titleKey)}
                </h3>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t(step.bodyKey)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-calm-hairline bg-white py-14">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-5 sm:px-8 lg:grid-cols-[360px_1fr] lg:px-10">
          <div>
            <p className="type-caption-strong text-action-blue">
              {t("invitation.accept.security.eyebrow")}
            </p>
            <h2 className="type-heading-lg mt-2 text-calm-ink">
              {t("invitation.accept.security.title")}
            </h2>
            <p className="type-caption mt-3 text-calm-ink-muted-80">
              {t("invitation.accept.security.description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <article
                className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-5"
                key={item.titleKey}
              >
                <h3 className="type-body-strong text-calm-ink">
                  {t(item.titleKey)}
                </h3>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t(item.bodyKey)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-canvas py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 type-caption text-calm-ink-muted-48 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <span>{t("invitation.accept.footer.note")}</span>
          <Link className="text-action-blue" href="/guide">
            {t("invitation.accept.footer.guide")}
          </Link>
        </div>
      </footer>
    </main>
  );
}
