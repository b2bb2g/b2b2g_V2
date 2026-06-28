import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import {
  getPublicCompanyProfile,
  type PublicCompanyProfile,
} from "@/lib/queries/companies";
import { t } from "@/lib/i18n/translation";
import {
  buildCompanyStructuredData,
  buildPublicMetadata,
  getPublicSeoMetadata,
  getStructuredData,
} from "@/lib/seo/metadata";

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

type SummaryItem = {
  href?: string;
  id: string;
  meta?: string | null;
  summary?: string | null;
  title: string;
};

function formatScore(score: number | null | undefined): string {
  if (typeof score !== "number") {
    return t("company.notAvailable");
  }

  return `${Math.round(score)}/100`;
}

function getVerificationLabel(profile: PublicCompanyProfile): string {
  if (profile.company.verification_status === "verified") {
    return t("company.verified");
  }

  return t("company.unverified");
}

function DetailStat({
  label,
  value,
}: Readonly<{
  label: string;
  value: string | null | undefined;
}>) {
  return (
    <div className="border-l border-slate-200 pl-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">
        {value || t("company.notAvailable")}
      </p>
    </div>
  );
}

function SummaryList({
  items,
  title,
}: Readonly<{
  items: SummaryItem[];
  title: string;
}>) {
  return (
    <section className="border-t border-slate-200 py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        </div>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const content = (
                <article className="h-full rounded border border-slate-200 bg-white p-5 transition hover:border-emerald-700">
                  {item.meta ? (
                    <p className="text-sm font-medium text-emerald-800">
                      {item.meta}
                    </p>
                  ) : null}
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  {item.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {item.summary}
                    </p>
                  ) : null}
                </article>
              );

              return item.href ? (
                <Link href={item.href} key={item.id}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        ) : (
          <p className="rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            {t("company.noData")}
          </p>
        )}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicCompanyProfile(slug);

  if (!profile) {
    return {
      title: t("company.heroEyebrow"),
    };
  }

  const seo = await getPublicSeoMetadata("companies", profile.company.id);

  return buildPublicMetadata({
    canonicalPath: `/companies/${slug}`,
    description: profile.company.description,
    seo,
    title: profile.company.name,
  });
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const profile = await getPublicCompanyProfile(slug);

  if (!profile) {
    notFound();
  }

  const seo = await getPublicSeoMetadata("companies", profile.company.id);
  const structuredData = getStructuredData(
    seo,
    buildCompanyStructuredData({
      country: profile.country?.name,
      description: profile.company.description,
      industry: profile.industry?.name,
      name: profile.company.name,
      path: `/companies/${profile.company.slug}`,
      website: profile.company.website,
    }),
  );
  const productItems = profile.products.map((product) => ({
    href: `/commercial/${product.id}`,
    id: product.id,
    summary: product.summary,
    title: product.title,
  }));
  const industrialItems = profile.industrialPosts.map((post) => ({
    href: `/industrial/${post.id}`,
    id: post.id,
    summary: post.summary,
    title: post.title,
  }));
  const epcItems = profile.epcPosts.map((post) => ({
    href: `/epc/${post.id}`,
    id: post.id,
    meta: post.project_scope,
    summary: post.summary,
    title: post.title,
  }));
  const buyRequestItems = profile.buyRequests.map((request) => ({
    href: `/buy-sell/buy-requests/${request.id}`,
    id: request.id,
    meta: request.quantity ?? request.target_price,
    title: request.title,
  }));

  return (
    <main>
      <JsonLd data={structuredData} />
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-10">
          <div className="flex flex-col justify-center">
            <Link
              className="mb-8 w-fit text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              href="/commercial"
            >
              {t("company.backToSuppliers")}
            </Link>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {t("company.heroEyebrow")}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {profile.company.name}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                {getVerificationLabel(profile)}
              </span>
              <span className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                {t("company.companyScore")}: {formatScore(profile.score?.score)}
              </span>
            </div>
            {profile.company.description ? (
              <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                {profile.company.description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="#inquiry">
                {t("company.sendInquiry")}
              </Link>
              <Link className="btn-secondary" href="#catalog">
                {t("company.downloadCatalog")}
              </Link>
              <Link className="btn-secondary" href="#save">
                {t("company.saveCompany")}
              </Link>
            </div>
          </div>

          <aside className="flex items-center">
            <div className="w-full rounded border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {t("company.companyScore")}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-800">
                    {formatScore(profile.score?.score)}
                  </p>
                </div>
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14"
                  height={56}
                  src="/globe.svg"
                  width={56}
                />
              </div>
              <div className="space-y-4">
                <DetailStat
                  label={t("company.profileScore")}
                  value={formatScore(profile.score?.profile_completion_score)}
                />
                <DetailStat
                  label={t("company.productScore")}
                  value={formatScore(profile.score?.product_score)}
                />
                <DetailStat
                  label={t("company.verificationScore")}
                  value={formatScore(profile.score?.verification_score)}
                />
                <DetailStat
                  label={t("company.responseScore")}
                  value={formatScore(profile.score?.response_score)}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              {t("company.overview")}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailStat label={t("company.country")} value={profile.country?.name} />
              <DetailStat label={t("company.industry")} value={profile.industry?.name} />
              <DetailStat
                label={t("company.companyType")}
                value={profile.companyType?.name}
              />
              <DetailStat label={t("company.website")} value={profile.company.website} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {t("company.certificates")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("company.noData")}
              </p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-5" id="catalog">
              <h3 className="text-lg font-semibold text-slate-950">
                {t("company.catalogDownloads")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("company.noData")}
              </p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {t("company.exportCountries")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {profile.country?.name ?? t("company.noData")}
              </p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-5" id="inquiry">
              <h3 className="text-lg font-semibold text-slate-950">
                {t("company.inquiryForm")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("company.noData")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SummaryList items={productItems} title={t("company.products")} />
      <SummaryList items={industrialItems} title={t("company.industrialProjects")} />
      <SummaryList items={epcItems} title={t("company.epcProjects")} />
      <SummaryList items={buyRequestItems} title={t("company.relatedBuyRequests")} />

      <section className="border-t border-slate-200 py-10" id="save">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold text-slate-950">
            {t("company.relatedCompanies")}
          </h2>
          <p className="mt-5 rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            {t("company.noData")}
          </p>
        </div>
      </section>
    </main>
  );
}
