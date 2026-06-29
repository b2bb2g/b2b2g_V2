import { t } from "@/lib/i18n/translation";

type AgentSignupFormProps = {
  invitationToken?: string | null;
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
  invitationToken,
}: Readonly<AgentSignupFormProps>) {
  const trimmedToken = invitationToken?.trim();

  return (
    <section className="bg-canvas pb-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="rounded-2xl border border-calm-hairline bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.06)]">
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
                type="checkbox"
                value="yes"
              />
              <span>{t("agentSignup.terms")}</span>
            </label>

            <button
              className="pill-primary mt-6 min-h-11 w-full cursor-not-allowed opacity-60"
              disabled
              type="button"
            >
              {t("agentSignup.submit.disabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {t("agentSignup.submit.next")}
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
