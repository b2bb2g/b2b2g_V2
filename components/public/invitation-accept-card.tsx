import Link from "next/link";
import type {
  InvitationType,
  PublicInvitationValidationResult,
} from "@/lib/invitations/types";
import { t } from "@/lib/i18n/translation";

type InvitationAcceptCardProps = {
  validation: PublicInvitationValidationResult;
};

const onboardingNotes = [
  {
    bodyKey: "invitation.accept.supplierDescription",
    titleKey: "invitation.accept.supplierTitle",
    types: ["supplier_admin_invite", "supplier_public_signup"],
  },
  {
    bodyKey: "invitation.accept.buyerDescription",
    titleKey: "invitation.accept.buyerTitle",
    types: ["buyer_agent_invite", "buyer_direct_signup"],
  },
  {
    bodyKey: "invitation.accept.studentDescription",
    titleKey: "invitation.accept.studentTitle",
    types: ["student_professor_invite"],
  },
  {
    bodyKey: "invitation.accept.agentProfessorDescription",
    titleKey: "invitation.accept.agentProfessorTitle",
    types: [
      "agent_admin_invite",
      "agent_public_application",
      "professor_admin_invite",
      "professor_public_application",
    ],
  },
] as const;

function getStatusDescriptionKey(validation: PublicInvitationValidationResult): string {
  if (validation.ok) {
    return "invitation.accept.validDescription";
  }

  if (validation.status === "expired") {
    return "invitation.accept.expiredDescription";
  }

  if (validation.status === "unavailable") {
    return "invitation.accept.validationUnavailableDescription";
  }

  return "invitation.accept.unavailableDescription";
}

function getMatchingNotes(invitationType: InvitationType | null) {
  if (!invitationType) {
    return onboardingNotes;
  }

  return onboardingNotes.filter((note) =>
    (note.types as readonly InvitationType[]).includes(invitationType),
  );
}

export function InvitationAcceptCard({
  validation,
}: Readonly<InvitationAcceptCardProps>) {
  const isValid = validation.ok && validation.status === "valid";
  const matchingNotes = getMatchingNotes(validation.invitationType);

  return (
    <main className="bg-canvas">
      <section className="bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1040px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">
              {t("invitation.accept.title")}
            </span>
          </nav>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-calm-hairline bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.08)] sm:p-8">
              <p className="type-caption-strong text-action-blue">
                {t("invitation.accept.eyebrow")}
              </p>
              <h1 className="type-display-md mt-4 text-calm-ink">
                {isValid
                  ? t("invitation.accept.validTitle")
                  : t("invitation.accept.unavailableTitle")}
              </h1>
              <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
                {t(getStatusDescriptionKey(validation))}
              </p>

              <div className="mt-8 rounded-xl border border-calm-hairline bg-canvas-parchment p-4">
                <h2 className="type-body-strong text-calm-ink">
                  {validation.validationAvailable
                    ? t("invitation.accept.validationCompleteTitle")
                    : t("invitation.accept.validationPendingTitle")}
                </h2>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {validation.validationAvailable
                    ? t("invitation.accept.validationCompleteDescription")
                    : t("invitation.accept.validationPendingDescription")}
                </p>
                {validation.ok ? (
                  <dl className="mt-4 grid gap-3 rounded-xl border border-calm-hairline bg-white p-4 type-caption text-calm-ink-muted-80 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-calm-ink">
                        {t("invitation.accept.field.role")}
                      </dt>
                      <dd className="mt-1">{validation.targetRoleKey}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-calm-ink">
                        {t("invitation.accept.field.emailMatch")}
                      </dt>
                      <dd className="mt-1">
                        {validation.invitedEmailMatchRequired
                          ? t("invitation.accept.emailMatch.required")
                          : t("invitation.accept.emailMatch.notRequired")}
                      </dd>
                    </div>
                  </dl>
                ) : null}
                <p className="type-caption mt-3 text-calm-ink-muted-80">
                  {t("invitation.accept.securityNote")}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  className="pill-primary min-h-11 cursor-not-allowed opacity-60"
                  disabled
                  type="button"
                >
                  {t("invitation.accept.signupDisabled")}
                </button>
                <Link className="pill-secondary min-h-11" href="/login">
                  {t("invitation.accept.signIn")}
                </Link>
              </div>
              <p className="type-caption mt-3 text-calm-ink-muted-48">
                {t("invitation.accept.signupDisabledMeta")}
              </p>
            </section>

            <aside className="rounded-2xl border border-calm-hairline bg-white p-5">
              <h2 className="type-body-strong text-calm-ink">
                {t("invitation.accept.todoTitle")}
              </h2>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t("invitation.accept.todoDescription")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="mx-auto grid max-w-[1040px] gap-4 px-5 sm:px-8 md:grid-cols-2 lg:px-10">
          {matchingNotes.map((note) => (
            <article
              className="rounded-2xl border border-calm-hairline bg-white p-5"
              key={note.titleKey}
            >
              <h2 className="type-body-strong text-calm-ink">
                {t(note.titleKey)}
              </h2>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t(note.bodyKey)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
