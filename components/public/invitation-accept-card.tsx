import Link from "next/link";
import type { PublicInvitationValidationResult } from "@/lib/invitations/actions";
import { t } from "@/lib/i18n/translation";

type InvitationAcceptCardProps = {
  validation: PublicInvitationValidationResult;
};

const onboardingNotes = [
  {
    bodyKey: "invitation.accept.supplierDescription",
    titleKey: "invitation.accept.supplierTitle",
  },
  {
    bodyKey: "invitation.accept.buyerDescription",
    titleKey: "invitation.accept.buyerTitle",
  },
  {
    bodyKey: "invitation.accept.studentDescription",
    titleKey: "invitation.accept.studentTitle",
  },
  {
    bodyKey: "invitation.accept.agentProfessorDescription",
    titleKey: "invitation.accept.agentProfessorTitle",
  },
] as const;

export function InvitationAcceptCard({
  validation,
}: Readonly<InvitationAcceptCardProps>) {
  const isReceived = validation.ok && validation.status === "received";

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
                {isReceived
                  ? t("invitation.accept.receivedTitle")
                  : t("invitation.accept.unavailableTitle")}
              </h1>
              <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
                {isReceived
                  ? t("invitation.accept.receivedDescription")
                  : t("invitation.accept.unavailableDescription")}
              </p>

              <div className="mt-8 rounded-xl border border-calm-hairline bg-canvas-parchment p-4">
                <h2 className="type-body-strong text-calm-ink">
                  {t("invitation.accept.validationPendingTitle")}
                </h2>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t("invitation.accept.validationPendingDescription")}
                </p>
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
          {onboardingNotes.map((note) => (
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
