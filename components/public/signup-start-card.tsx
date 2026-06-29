import Link from "next/link";
import { t } from "@/lib/i18n/translation";

export type SignupStartRole = "agent" | "buyer" | "professor" | "student" | "supplier";

type SignupStartCardProps = {
  hasInvitationToken: boolean;
  role: SignupStartRole;
};

type SignupStartConfig = {
  approvalKey: string;
  capabilities: string[];
  directStatusKey: string;
  invitationStatusKey: string;
  preparation: string[];
  titleKey: string;
};

const signupStartConfig: Record<SignupStartRole, SignupStartConfig> = {
  agent: {
    approvalKey: "signupStart.agent.approval",
    capabilities: [
      "signupStart.agent.capability.markets",
      "signupStart.agent.capability.buyers",
      "signupStart.agent.capability.invites",
    ],
    directStatusKey: "signupStart.agent.directStatus",
    invitationStatusKey: "signupStart.agent.invitationStatus",
    preparation: [
      "signupStart.agent.prepare.profile",
      "signupStart.agent.prepare.market",
      "signupStart.agent.prepare.approval",
    ],
    titleKey: "signupStart.agent.title",
  },
  buyer: {
    approvalKey: "signupStart.buyer.approval",
    capabilities: [
      "signupStart.buyer.capability.requests",
      "signupStart.buyer.capability.agent",
      "signupStart.buyer.capability.brokerage",
    ],
    directStatusKey: "signupStart.buyer.directStatus",
    invitationStatusKey: "signupStart.buyer.invitationStatus",
    preparation: [
      "signupStart.buyer.prepare.company",
      "signupStart.buyer.prepare.demand",
      "signupStart.buyer.prepare.agent",
    ],
    titleKey: "signupStart.buyer.title",
  },
  professor: {
    approvalKey: "signupStart.professor.approval",
    capabilities: [
      "signupStart.professor.capability.students",
      "signupStart.professor.capability.program",
      "signupStart.professor.capability.invites",
    ],
    directStatusKey: "signupStart.professor.directStatus",
    invitationStatusKey: "signupStart.professor.invitationStatus",
    preparation: [
      "signupStart.professor.prepare.profile",
      "signupStart.professor.prepare.school",
      "signupStart.professor.prepare.approval",
    ],
    titleKey: "signupStart.professor.title",
  },
  student: {
    approvalKey: "signupStart.student.approval",
    capabilities: [
      "signupStart.student.capability.showcase",
      "signupStart.student.capability.research",
      "signupStart.student.capability.professor",
    ],
    directStatusKey: "signupStart.student.directStatus",
    invitationStatusKey: "signupStart.student.invitationStatus",
    preparation: [
      "signupStart.student.prepare.invite",
      "signupStart.student.prepare.profile",
      "signupStart.student.prepare.program",
    ],
    titleKey: "signupStart.student.title",
  },
  supplier: {
    approvalKey: "signupStart.supplier.approval",
    capabilities: [
      "signupStart.supplier.capability.company",
      "signupStart.supplier.capability.products",
      "signupStart.supplier.capability.membership",
    ],
    directStatusKey: "signupStart.supplier.directStatus",
    invitationStatusKey: "signupStart.supplier.invitationStatus",
    preparation: [
      "signupStart.supplier.prepare.company",
      "signupStart.supplier.prepare.products",
      "signupStart.supplier.prepare.approval",
    ],
    titleKey: "signupStart.supplier.title",
  },
};

export function SignupStartCard({
  hasInvitationToken,
  role,
}: Readonly<SignupStartCardProps>) {
  const config = signupStartConfig[role];

  return (
    <main className="bg-canvas">
      <section className="border-b border-calm-hairline bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link className="text-action-blue" href="/signup/invitation">
              {t("signupStart.nav.invitation")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">{t(config.titleKey)}</span>
          </nav>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="type-caption-strong text-action-blue">
                {t("signupStart.eyebrow")}
              </p>
              <h1 className="type-display-lg mt-4 max-w-3xl text-calm-ink">
                {t(config.titleKey)}
              </h1>
              <p className="type-body mt-5 max-w-2xl text-calm-ink-muted-80">
                {t(
                  hasInvitationToken
                    ? config.invitationStatusKey
                    : config.directStatusKey,
                )}
              </p>
            </div>

            <aside className="rounded-2xl border border-calm-hairline bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.08)]">
              <p className="type-caption-strong text-calm-ink-muted-48">
                {t("signupStart.currentStep")}
              </p>
              <h2 className="type-heading-sm mt-2 text-calm-ink">
                {t(
                  hasInvitationToken
                    ? "signupStart.step.invitationReady"
                    : "signupStart.step.publicEntry",
                )}
              </h2>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t("signupStart.tokenHidden")}
              </p>

              <button
                className="pill-primary mt-6 min-h-11 w-full cursor-not-allowed opacity-60"
                disabled
                type="button"
              >
                {t("signupStart.cta.disabled")}
              </button>
              <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
                {t("signupStart.cta.next")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:px-8 lg:grid-cols-3 lg:px-10">
          <article className="rounded-2xl border border-calm-hairline bg-white p-6">
            <p className="type-caption-strong text-action-blue">
              {t("signupStart.card.capabilities")}
            </p>
            <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
              {config.capabilities.map((key) => (
                <li className="border-l border-calm-hairline pl-3" key={key}>
                  {t(key)}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-calm-hairline bg-white p-6">
            <p className="type-caption-strong text-action-blue">
              {t("signupStart.card.approval")}
            </p>
            <p className="type-caption mt-4 text-calm-ink-muted-80">
              {t(config.approvalKey)}
            </p>
          </article>

          <article className="rounded-2xl border border-calm-hairline bg-white p-6">
            <p className="type-caption-strong text-action-blue">
              {t("signupStart.card.prepare")}
            </p>
            <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
              {config.preparation.map((key) => (
                <li className="border-l border-calm-hairline pl-3" key={key}>
                  {t(key)}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-calm-hairline bg-white py-12">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h2 className="type-heading-sm text-calm-ink">
                {t("signupStart.security.title")}
              </h2>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t("signupStart.security.body")}
              </p>
            </div>
            <div>
              <h2 className="type-heading-sm text-calm-ink">
                {t("signupStart.deferred.title")}
              </h2>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t("signupStart.deferred.body")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
