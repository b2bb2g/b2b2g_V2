import { t } from "@/lib/i18n/translation";

type StudentSignupFormProps = {
  invitationToken?: string | null;
};

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

export function StudentSignupForm({
  invitationToken,
}: Readonly<StudentSignupFormProps>) {
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
                {t("studentSignup.form.eyebrow")}
              </p>
              <h2 className="type-heading-md mt-2 text-calm-ink">
                {t("studentSignup.form.title")}
              </h2>
              <p className="type-caption mt-3 max-w-2xl text-calm-ink-muted-80">
                {t("studentSignup.form.description")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-status-warning/20 bg-status-warning-bg p-4">
              <p className="type-caption-strong text-calm-ink">
                {t("studentSignup.publicOff.title")}
              </p>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t("studentSignup.publicOff.description")}
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="student-contact-email">
                  {t("studentSignup.field.contactEmail")}
                </FieldLabel>
                <input
                  autoComplete="email"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-contact-email"
                  name="contact_email"
                  placeholder={t("studentSignup.placeholder.contactEmail")}
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="student-name">
                  {t("studentSignup.field.studentName")}
                </FieldLabel>
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-name"
                  name="student_name"
                  placeholder={t("studentSignup.placeholder.studentName")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="student-university">
                  {t("studentSignup.field.university")}
                </FieldLabel>
                <input
                  autoComplete="organization"
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-university"
                  name="university"
                  placeholder={t("studentSignup.placeholder.university")}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="student-major">
                  {t("studentSignup.field.departmentMajor")}
                </FieldLabel>
                <input
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-major"
                  name="department_major"
                  placeholder={t("studentSignup.placeholder.departmentMajor")}
                  type="text"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="student-program">
                  {t("studentSignup.field.programCourse")}
                </FieldLabel>
                <input
                  className="min-h-11 w-full rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-program"
                  name="program_or_course"
                  placeholder={t("studentSignup.placeholder.programCourse")}
                  type="text"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="student-showcase-summary">
                  {t("studentSignup.field.showcaseSummary")}
                </FieldLabel>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-calm-hairline bg-white px-4 py-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                  id="student-showcase-summary"
                  name="portfolio_showcase_summary"
                  placeholder={t("studentSignup.placeholder.showcaseSummary")}
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
              <span>{t("studentSignup.terms")}</span>
            </label>

            <button
              className="pill-primary mt-6 min-h-11 w-full cursor-not-allowed opacity-60"
              disabled
              type="button"
            >
              {t("studentSignup.submit.disabled")}
            </button>
            <p className="type-caption mt-3 text-center text-calm-ink-muted-48">
              {t("studentSignup.submit.next")}
            </p>
          </form>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("studentSignup.policy.title")}
              </p>
              <ul className="mt-4 space-y-3 type-caption text-calm-ink-muted-80">
                <li>{t("studentSignup.policy.professorInvitation")}</li>
                <li>{t("studentSignup.policy.publicOff")}</li>
                <li>{t("studentSignup.policy.professorRelation")}</li>
                <li>{t("studentSignup.policy.showcaseLater")}</li>
                <li>{t("studentSignup.policy.noDirectProduct")}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-calm-hairline bg-white p-6">
              <p className="type-caption-strong text-action-blue">
                {t("studentSignup.security.title")}
              </p>
              <p className="type-caption mt-3 text-calm-ink-muted-80">
                {t(
                  trimmedToken
                    ? "studentSignup.security.invitationToken"
                    : "studentSignup.security.noPublicSignup",
                )}
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
