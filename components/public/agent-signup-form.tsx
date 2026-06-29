"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  submitAgentRoleApplication,
  type AgentSignupSubmitState,
} from "@/lib/actions/agent-signup";
import { t } from "@/lib/i18n/translation";

type AgentSignupFormProps = {
  isAuthenticated: boolean;
  invitationToken?: string | null;
};

const initialSubmitState: AgentSignupSubmitState = {
  error: null,
  ok: false,
  recordId: null,
};

const marketOptions = [
  "agentSignup.market.placeholder",
  "agentSignup.market.thailand",
  "agentSignup.market.vietnam",
  "agentSignup.market.usa",
  "agentSignup.market.korea",
  "agentSignup.market.other",
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

export function AgentSignupForm({
  isAuthenticated,
  invitationToken,
}: Readonly<AgentSignupFormProps>) {
  const trimmedToken = invitationToken?.trim();
  const [state, formAction, isPending] = useActionState(
    submitAgentRoleApplication,
    initialSubmitState,
  );
  const isSubmitted = state.ok;
  const isSubmitDisabled = !isAuthenticated || isPending || isSubmitted;

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
                {t("agentSignup.form.eyebrow")}
              </p>
              <h2 className="type-heading-md mt-2 text-calm-ink">
                {t("agentSignup.form.title")}
              </h2>
              <p className="type-caption mt-3 max-w-2xl text-calm-ink-muted-80">
                {t("agentSignup.form.description")}
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-2xl border border-action-blue/20 bg-action-blue/5 p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("agentSignup.auth.requiredTitle")}
                </p>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {t("agentSignup.auth.requiredDescription")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link className="pill-primary min-h-10" href="/login">
                    {t("agentSignup.auth.signIn")}
                  </Link>
                  <Link className="pill-secondary min-h-10" href="/signup">
                    {t("agentSignup.auth.createAccount")}
                  </Link>
                </div>
              </div>
            ) : null}

            {state.ok ? (
              <div className="mt-6 rounded-2xl border border-status-positive/20 bg-status-positive-bg p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("agentSignup.success.title")}
                </p>
                <ul className="mt-3 space-y-2 type-caption text-calm-ink-muted-80">
                  <li>{t("agentSignup.success.adminApproval")}</li>
                  <li>{t("agentSignup.success.buyerInvites")}</li>
                </ul>
              </div>
            ) : null}

            {state.error ? (
              <div className="mt-6 rounded-2xl border border-status-negative/20 bg-status-negative-bg p-4">
                <p className="type-caption-strong text-calm-ink">
                  {t("agentSignup.error.title")}
                </p>
                <p className="type-caption mt-2 text-calm-ink-muted-80">
                  {state.error}
                </p>
              </div>
            ) : null}

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="agent-contact-email">
                  {t("agentSignup.field.contactEmail")}
                </FieldLabel>
                <input
                  autoComplete="email"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-contact-email"
                  name="contact_email"
                  placeholder={t("agentSignup.placeholder.contactEmail")}
                  required
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="agent-contact-name">
                  {t("agentSignup.field.contactName")}
                </FieldLabel>
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-contact-name"
                  name="contact_name"
                  placeholder={t("agentSignup.placeholder.contactName")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="agent-market">
                  {t("agentSignup.field.market")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-market"
                  name="country_market"
                  required
                >
                  {marketOptions.map((key, index) => (
                    <option disabled={index === 0} key={key} value={index === 0 ? "" : t(key)}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="agent-organization">
                  {t("agentSignup.field.organizationName")}
                </FieldLabel>
                <input
                  autoComplete="organization"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-organization"
                  name="organization_name"
                  placeholder={t("agentSignup.placeholder.organizationName")}
                  required
                  type="text"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="agent-experience-summary">
                  {t("agentSignup.field.experienceSummary")}
                </FieldLabel>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-experience-summary"
                  name="experience_summary"
                  placeholder={t("agentSignup.placeholder.experienceSummary")}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="agent-target-buyer-market">
                  {t("agentSignup.field.targetBuyerMarket")}
                </FieldLabel>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-target-buyer-market"
                  name="target_buyer_market"
                  placeholder={t("agentSignup.placeholder.targetBuyerMarket")}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="agent-profile-url">
                  {t("agentSignup.field.websiteOrProfile")}
                </FieldLabel>
                <input
                  autoComplete="url"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="agent-profile-url"
                  name="website_or_profile_url"
                  placeholder={t("agentSignup.placeholder.websiteOrProfile")}
                  type="url"
                />
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
              <span>{t("agentSignup.terms")}</span>
            </label>

            <button
              className={`pill-primary mt-6 min-h-11 w-full ${
                isSubmitDisabled ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitted
                ? t("agentSignup.submit.submitted")
                : isPending
                  ? t("agentSignup.submit.pending")
                  : t("agentSignup.submit.enabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {isAuthenticated
                ? t("agentSignup.submit.ready")
                : t("agentSignup.submit.authRequired")}
            </p>
          </form>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("agentSignup.policy.title")}
              </p>
              <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
                <li>{t("agentSignup.policy.signupPaths")}</li>
                <li>{t("agentSignup.policy.approvalRequired")}</li>
                <li>{t("agentSignup.policy.buyerInvites")}</li>
                <li>{t("agentSignup.policy.subordinateBuyers")}</li>
                <li>{t("agentSignup.policy.buyerPii")}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("agentSignup.security.title")}
              </p>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t(
                  trimmedToken
                    ? "agentSignup.security.invitationToken"
                    : "agentSignup.security.publicApplication",
                )}
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
