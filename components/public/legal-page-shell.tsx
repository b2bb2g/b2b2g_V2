import Link from "next/link";
import { t } from "@/lib/i18n/translation";

type LegalSection = {
  bodyKeys: readonly string[];
  titleKey: string;
};

type LegalPageShellProps = {
  descriptionKey: string;
  sections: readonly LegalSection[];
  titleKey: string;
};

export function LegalPageShell({
  descriptionKey,
  sections,
  titleKey,
}: Readonly<LegalPageShellProps>) {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="mx-auto max-w-[1040px] px-5 sm:px-8 lg:px-10">
          <nav className="legal-breadcrumb">
            <Link href="/">{t("brand.name")}</Link>
            <span aria-hidden="true">/</span>
            <span>{t(titleKey)}</span>
          </nav>
          <p className="landing-section-kicker">{t("legal.eyebrow")}</p>
          <h1>{t(titleKey)}</h1>
          <p>{t(descriptionKey)}</p>
          <span className="legal-updated-pill">{t("legal.updated")}</span>
        </div>
      </section>

      <section className="legal-content-section">
        <div className="mx-auto grid max-w-[1040px] gap-6 px-5 sm:px-8 lg:grid-cols-[260px_1fr] lg:px-10">
          <aside className="legal-side-panel">
            <p>{t("legal.sideTitle")}</p>
            <nav>
              {sections.map((section) => (
                <a href={`#${section.titleKey}`} key={section.titleKey}>
                  {t(section.titleKey)}
                </a>
              ))}
            </nav>
          </aside>

          <div className="legal-document-card">
            {sections.map((section) => (
              <section id={section.titleKey} key={section.titleKey}>
                <h2>{t(section.titleKey)}</h2>
                {section.bodyKeys.map((bodyKey) => (
                  <p key={bodyKey}>{t(bodyKey)}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
