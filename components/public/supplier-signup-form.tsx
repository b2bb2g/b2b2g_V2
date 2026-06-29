import { t } from "@/lib/i18n/translation";

type SupplierSignupFormProps = {
  invitationToken?: string | null;
};

const countryOptions = [
  "supplierSignup.country.placeholder",
  "supplierSignup.country.korea",
  "supplierSignup.country.thailand",
  "supplierSignup.country.vietnam",
  "supplierSignup.country.usa",
  "supplierSignup.country.other",
];

const productCategoryOptions = [
  "supplierSignup.category.placeholder",
  "supplierSignup.category.consumerGoods",
  "supplierSignup.category.beauty",
  "supplierSignup.category.food",
  "supplierSignup.category.industrial",
  "supplierSignup.category.epc",
  "supplierSignup.category.other",
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

export function SupplierSignupForm({
  invitationToken,
}: Readonly<SupplierSignupFormProps>) {
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
                {t("supplierSignup.form.eyebrow")}
              </p>
              <h2 className="type-heading-md mt-2 text-calm-ink">
                {t("supplierSignup.form.title")}
              </h2>
              <p className="type-caption mt-3 max-w-2xl text-calm-ink-muted-80">
                {t("supplierSignup.form.description")}
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="supplier-contact-email">
                  {t("supplierSignup.field.contactEmail")}
                </FieldLabel>
                <input
                  autoComplete="email"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-contact-email"
                  name="contact_email"
                  placeholder={t("supplierSignup.placeholder.contactEmail")}
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="supplier-contact-name">
                  {t("supplierSignup.field.contactName")}
                </FieldLabel>
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-contact-name"
                  name="contact_name"
                  placeholder={t("supplierSignup.placeholder.contactName")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="supplier-company-name">
                  {t("supplierSignup.field.companyName")}
                </FieldLabel>
                <input
                  autoComplete="organization"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-company-name"
                  name="company_name"
                  placeholder={t("supplierSignup.placeholder.companyName")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="supplier-country">
                  {t("supplierSignup.field.country")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-country"
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
                <FieldLabel htmlFor="supplier-product-category">
                  {t("supplierSignup.field.productCategory")}
                </FieldLabel>
                <select
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-product-category"
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
                <FieldLabel htmlFor="supplier-product-summary">
                  {t("supplierSignup.field.productSummary")}
                </FieldLabel>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-product-summary"
                  name="product_summary"
                  placeholder={t("supplierSignup.placeholder.productSummary")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="supplier-catalog-url">
                  {t("supplierSignup.field.websiteOrCatalog")}
                </FieldLabel>
                <input
                  autoComplete="url"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="supplier-catalog-url"
                  name="website_or_catalog_url"
                  placeholder={t("supplierSignup.placeholder.websiteOrCatalog")}
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
              <span>{t("supplierSignup.terms")}</span>
            </label>

            <button
              className="pill-primary mt-6 min-h-11 w-full cursor-not-allowed opacity-60"
              disabled
              type="button"
            >
              {t("supplierSignup.submit.disabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {t("supplierSignup.submit.next")}
            </p>
          </form>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("supplierSignup.policy.title")}
              </p>
              <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
                <li>{t("supplierSignup.policy.signupPaths")}</li>
                <li>{t("supplierSignup.policy.approvalRequired")}</li>
                <li>{t("supplierSignup.policy.companyProductApproval")}</li>
                <li>{t("supplierSignup.policy.buyerPii")}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("supplierSignup.security.title")}
              </p>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t(
                  trimmedToken
                    ? "supplierSignup.security.invitationToken"
                    : "supplierSignup.security.publicSignup",
                )}
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
