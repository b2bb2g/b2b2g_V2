import { t } from "@/lib/i18n/translation";

type BuyerSignupFormProps = {
  invitationToken?: string | null;
};

const countryOptions = [
  "buyerSignup.country.placeholder",
  "buyerSignup.country.thailand",
  "buyerSignup.country.vietnam",
  "buyerSignup.country.usa",
  "buyerSignup.country.korea",
  "buyerSignup.country.other",
];

const productCategoryOptions = [
  "buyerSignup.category.placeholder",
  "buyerSignup.category.consumerGoods",
  "buyerSignup.category.beauty",
  "buyerSignup.category.food",
  "buyerSignup.category.industrial",
  "buyerSignup.category.epc",
  "buyerSignup.category.other",
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

export function BuyerSignupForm({
  invitationToken,
}: Readonly<BuyerSignupFormProps>) {
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
                {t("buyerSignup.form.eyebrow")}
              </p>
              <h2 className="type-heading-md mt-2 text-calm-ink">
                {t("buyerSignup.form.title")}
              </h2>
              <p className="type-caption mt-3 max-w-2xl text-calm-ink-muted-80">
                {t("buyerSignup.form.description")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-status-warning/20 bg-status-warning-bg p-4">
              <p className="type-caption-strong text-calm-ink">
                {t("buyerSignup.directOff.title")}
              </p>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t("buyerSignup.directOff.description")}
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="buyer-contact-email">
                  {t("buyerSignup.field.contactEmail")}
                </FieldLabel>
                <input
                  autoComplete="email"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-contact-email"
                  name="contact_email"
                  placeholder={t("buyerSignup.placeholder.contactEmail")}
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="buyer-name">
                  {t("buyerSignup.field.buyerName")}
                </FieldLabel>
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-name"
                  name="buyer_name"
                  placeholder={t("buyerSignup.placeholder.buyerName")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="buyer-organization">
                  {t("buyerSignup.field.organization")}
                </FieldLabel>
                <input
                  autoComplete="organization"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-organization"
                  name="organization"
                  placeholder={t("buyerSignup.placeholder.organization")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="buyer-country">
                  {t("buyerSignup.field.country")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-country"
                  name="country"
                >
                  {countryOptions.map((key, index) => (
                    <option disabled={index === 0} key={key} value={index === 0 ? "" : t(key)}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="buyer-category">
                  {t("buyerSignup.field.productCategory")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-category"
                  name="product_category"
                >
                  {productCategoryOptions.map((key, index) => (
                    <option disabled={index === 0} key={key} value={index === 0 ? "" : t(key)}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="buyer-demand-summary">
                  {t("buyerSignup.field.demandSummary")}
                </FieldLabel>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-demand-summary"
                  name="purchase_demand_summary"
                  placeholder={t("buyerSignup.placeholder.demandSummary")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="buyer-website">
                  {t("buyerSignup.field.website")}
                </FieldLabel>
                <input
                  autoComplete="url"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="buyer-website"
                  name="website_company_url"
                  placeholder={t("buyerSignup.placeholder.website")}
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
              <span>{t("buyerSignup.terms")}</span>
            </label>

            <button
              className="pill-primary mt-6 min-h-11 w-full cursor-not-allowed opacity-60"
              disabled
              type="button"
            >
              {t("buyerSignup.submit.disabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {t("buyerSignup.submit.next")}
            </p>
          </form>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("buyerSignup.policy.title")}
              </p>
              <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
                <li>{t("buyerSignup.policy.agentInvitation")}</li>
                <li>{t("buyerSignup.policy.directOff")}</li>
                <li>{t("buyerSignup.policy.buyRequestsLater")}</li>
                <li>{t("buyerSignup.policy.noSupplierDirectContact")}</li>
                <li>{t("buyerSignup.policy.brokerageProtectsContact")}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("buyerSignup.security.title")}
              </p>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t(
                  trimmedToken
                    ? "buyerSignup.security.invitationToken"
                    : "buyerSignup.security.noDirectSignup",
                )}
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
