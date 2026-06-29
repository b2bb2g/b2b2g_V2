import Link from "next/link";
import { ArrowRightIcon } from "@/components/public/icons";
import {
  CopyReferralButton,
  ReferralMentorCard,
  ReferralLookupPanel,
  ReferralQrCard,
  ReferralShareButton,
  ReferralStudentRoster,
  ReferralTreeView,
} from "@/components/dashboard/referral-tools";
import { Badge, StatusBadge, toneForStatus } from "@/components/shared/badge";
import {
  createDashboardStudentShowcase,
  sendDashboardMessage,
  submitDashboardStudentShowcase,
  updateDashboardCompanyProfile,
} from "@/lib/actions/business";
import { createDashboardProduct } from "@/lib/actions/dashboard-products";
import { updateProfile } from "@/lib/actions/profile";
import { generateReferralCode } from "@/lib/actions/referrals";
import { t } from "@/lib/i18n/translation";
import type {
  DashboardAccountData,
  DashboardAgentOnboardingData,
  DashboardActivitiesData,
  DashboardActivityRecord,
  DashboardCompanyData,
  DashboardCompanyOption,
  DashboardCompanyProfile,
  DashboardConversation,
  DashboardMessagesData,
  DashboardOverviewData,
  DashboardProductRecord,
  DashboardProductsData,
  DashboardQuickAction,
  DashboardReferralData,
  DashboardRecord,
  DashboardSectionData,
  DashboardSupplierOnboardingData,
  DashboardStudentShowcaseData,
} from "@/lib/queries/dashboard";

function RecordCard({ record }: { record: DashboardRecord }) {
  const title = record.title.startsWith("dashboard.") ? t(record.title) : record.title;

  const content = (
    <article className="group flex h-full flex-col gap-3 rounded-[18px] border border-calm-hairline bg-white p-5 transition hover:border-action-blue/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={record.status} />
        {record.meta ? (
          <span className="type-fine-print text-calm-ink-muted-48">{record.meta}</span>
        ) : null}
      </div>
      <h3 className="type-body-strong line-clamp-2 text-calm-ink transition group-hover:text-action-blue">
        {title}
      </h3>
      {record.href ? (
        <span className="mt-auto flex items-center gap-1 type-button-utility text-action-blue">
          {t("content.viewDetails")}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      ) : null}
    </article>
  );

  if (!record.href) {
    return content;
  }

  return (
    <Link className="block h-full" href={record.href}>
      {content}
    </Link>
  );
}

function getDashboardRecordKey(record: DashboardRecord, index: number, scope: string) {
  return [
    scope,
    record.href ?? "no-href",
    record.status ?? "no-status",
    record.title,
    record.meta ?? "no-meta",
    index,
  ].join(":");
}

function getDashboardQuickActionKey(action: DashboardQuickAction, index: number, scope: string) {
  return [scope, action.href, action.labelKey, action.metaKey, index].join(":");
}

const STUDENT_SHOWCASE_STEPS = [
  {
    descriptionKey: "dashboard.products.showcase.step.productDescription",
    number: "01",
    titleKey: "dashboard.products.showcase.step.product",
  },
  {
    descriptionKey: "dashboard.products.showcase.step.marketDescription",
    number: "02",
    titleKey: "dashboard.products.showcase.step.market",
  },
  {
    descriptionKey: "dashboard.products.showcase.step.reviewDescription",
    number: "03",
    titleKey: "dashboard.products.showcase.step.review",
  },
];

function EmptyState({ labelKey }: { labelKey: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-calm-hairline bg-white p-8 text-center type-body text-calm-ink-muted-48">
      {t(labelKey)}
    </div>
  );
}

function PageHeader({
  descriptionKey,
  eyebrowKey,
  titleKey,
}: {
  descriptionKey: string;
  eyebrowKey: string;
  titleKey: string;
}) {
  return (
    <div>
      <Badge dot={false} tone="info">
        {t(eyebrowKey)}
      </Badge>
      <h1 className="type-display-md mt-3 text-calm-ink">{t(titleKey)}</h1>
      <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">{t(descriptionKey)}</p>
    </div>
  );
}

function QuickActionCard({ action }: { action: DashboardQuickAction }) {
  return (
    <Link
      className="group flex min-h-[132px] flex-col justify-between rounded-[18px] border border-calm-hairline bg-white p-5 transition hover:-translate-y-0.5 hover:border-action-blue/35 hover:shadow-[0_18px_44px_rgba(0,102,204,0.08)]"
      href={action.href}
    >
      <div>
        <p className="type-caption-strong text-action-blue">{t("dashboard.openWorkspace")}</p>
        <h3 className="type-body-strong mt-3 text-calm-ink">{t(action.labelKey)}</h3>
        <p className="type-caption mt-2 text-calm-ink-muted-64">{t(action.metaKey)}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 type-button-utility text-action-blue">
        {t("content.viewDetails")}
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function getCareerRankHelpKeys(memberTypeCode: DashboardOverviewData["context"]["memberTypeCode"]) {
  const roleKey =
    memberTypeCode === "supplier" ||
    memberTypeCode === "buyer" ||
    memberTypeCode === "agent" ||
    memberTypeCode === "professor" ||
    memberTypeCode === "student"
      ? memberTypeCode
      : "default";

  return {
    bodyKey: `dashboard.careerRank.${roleKey}.helpBody`,
    titleKey: `dashboard.careerRank.${roleKey}.helpTitle`,
  };
}

function RoleHero({ data }: { data: DashboardOverviewData }) {
  const displayName = data.context.displayName ?? data.context.email;
  const careerRankHelp = getCareerRankHelpKeys(data.context.memberTypeCode);

  return (
    <section className="overflow-hidden rounded-[28px] border border-calm-hairline bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_52%,#edf5ff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
        <div className="flex min-h-[320px] flex-col justify-between">
          <div>
            <Badge dot={false} tone="info">
              {t(data.rolePanel.focusKey)}
            </Badge>
            <h1 className="type-display-lg mt-5 max-w-4xl text-[color:var(--calm-ink)]">
              {t(data.rolePanel.titleKey)}
            </h1>
            <p className="type-body mt-4 max-w-3xl text-calm-ink-muted-80">
              {t(data.rolePanel.descriptionKey)}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="pill-primary" href={data.quickActions[0]?.href ?? "/dashboard/account"}>
              {data.quickActions[0] ? t(data.quickActions[0].labelKey) : t("dashboard.account.edit")}
            </Link>
            <Link className="pill-secondary" href="/dashboard/account">
              {t("dashboard.account.edit")}
            </Link>
          </div>
        </div>

        <aside className="rounded-[24px] border border-action-blue/12 bg-white/82 p-5 shadow-[0_18px_44px_rgba(0,102,204,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="type-caption text-calm-ink-muted-48">{t("dashboard.account")}</p>
              <h2 className="type-tagline mt-2 text-calm-ink">{displayName}</h2>
            </div>
            <StatusBadge value={data.context.activityStatus} />
          </div>

          <div className="mt-5 grid gap-2">
            <div className="rounded-2xl bg-canvas-parchment p-4">
              <p className="type-fine-print text-calm-ink-muted-48">
                {t("dashboard.memberType")}
              </p>
              <p className="type-body-strong mt-1 capitalize text-calm-ink">
                {data.context.memberTypeCode}
              </p>
            </div>
            <div className="rounded-2xl bg-canvas-parchment p-4">
              <div className="dashboard-career-rank-label">
                <p className="type-fine-print text-calm-ink-muted-48">{t("dashboard.careerRank")}</p>
                <details className="dashboard-career-rank-help">
                  <summary aria-label={t("dashboard.careerRank.helpLabel")}>!</summary>
                  <div className="dashboard-career-rank-popover">
                    <strong>{t(careerRankHelp.titleKey)}</strong>
                    <p>{t(careerRankHelp.bodyKey)}</p>
                  </div>
                </details>
              </div>
              <p className="type-body-strong mt-1 text-calm-ink">
                {data.context.careerRankName ?? t("dashboard.careerRank.empty")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {data.metrics.slice(0, 4).map((metric) => (
              <article
                className="rounded-2xl border border-calm-hairline bg-white p-4"
                key={metric.labelKey}
              >
                <p className="type-fine-print text-calm-ink-muted-48">{t(metric.labelKey)}</p>
                <p className="type-tagline mt-2 text-action-blue">{metric.value}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function getSupplierOnboardingTone(
  status: DashboardSupplierOnboardingData["status"],
) {
  if (status === "approved") {
    return "positive";
  }

  if (status === "rejected") {
    return "negative";
  }

  return "warning";
}

function SupplierOnboardingPlaceholder({
  onboarding,
}: {
  onboarding: DashboardSupplierOnboardingData;
}) {
  return (
    <section className="mt-8 rounded-[24px] border border-action-blue/20 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_58%,#edf5ff_100%)] p-5 shadow-[0_18px_44px_rgba(0,102,204,0.06)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge dot={false} tone={getSupplierOnboardingTone(onboarding.status)}>
            {t(`dashboard.supplierOnboarding.status.${onboarding.status}`)}
          </Badge>
          <h2 className="type-tagline mt-3 text-calm-ink">
            {t(onboarding.titleKey)}
          </h2>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t(onboarding.descriptionKey)}
          </p>
        </div>
        <div className="rounded-2xl border border-calm-hairline bg-white px-4 py-3">
          <p className="type-fine-print text-calm-ink-muted-48">
            {t("dashboard.supplierOnboarding.applicationStatus")}
          </p>
          <p className="type-caption-strong mt-1 text-calm-ink">
            {onboarding.applicationStatus
              ? t(`dashboard.supplierOnboarding.application.${onboarding.applicationStatus}`)
              : t("dashboard.supplierOnboarding.application.none")}
          </p>
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-status-warning/20 bg-status-warning-bg px-4 py-3 type-caption text-status-warning">
        {t("dashboard.supplierOnboarding.noAutoCreation")}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {onboarding.nextSteps.map((step) => (
          <article
            className="flex min-h-[168px] flex-col justify-between rounded-[18px] border border-calm-hairline bg-white p-5"
            key={step.labelKey}
          >
            <div>
              <p className="type-caption-strong text-action-blue">
                {t(step.labelKey)}
              </p>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t(step.metaKey)}
              </p>
            </div>
            <button
              className="mt-5 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-full border border-calm-hairline bg-canvas-parchment px-4 type-caption-strong text-calm-ink-muted-48"
              disabled
              type="button"
            >
              {t("dashboard.supplierOnboarding.comingSoon")}
            </button>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-calm-hairline bg-white px-4 py-3">
        <p className="type-caption-strong text-calm-ink">
          {t("dashboard.supplierOnboarding.securityTitle")}
        </p>
        <p className="type-caption mt-2 text-calm-ink-muted-80">
          {t("dashboard.supplierOnboarding.securityBody")}
        </p>
      </div>
    </section>
  );
}

function getAgentOnboardingTone(status: DashboardAgentOnboardingData["status"]) {
  if (status === "approved") {
    return "positive";
  }

  if (status === "rejected") {
    return "negative";
  }

  return "warning";
}

function AgentOnboardingPlaceholder({
  onboarding,
}: {
  onboarding: DashboardAgentOnboardingData;
}) {
  return (
    <section className="mt-8 rounded-[24px] border border-action-blue/20 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_58%,#edf5ff_100%)] p-5 shadow-[0_18px_44px_rgba(0,102,204,0.06)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge dot={false} tone={getAgentOnboardingTone(onboarding.status)}>
            {t(`dashboard.agentOnboarding.status.${onboarding.status}`)}
          </Badge>
          <h2 className="type-tagline mt-3 text-calm-ink">
            {t(onboarding.titleKey)}
          </h2>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t(onboarding.descriptionKey)}
          </p>
        </div>
        <div className="rounded-2xl border border-calm-hairline bg-white px-4 py-3">
          <p className="type-fine-print text-calm-ink-muted-48">
            {t("dashboard.agentOnboarding.applicationStatus")}
          </p>
          <p className="type-caption-strong mt-1 text-calm-ink">
            {onboarding.applicationStatus
              ? t(`dashboard.agentOnboarding.application.${onboarding.applicationStatus}`)
              : t("dashboard.agentOnboarding.application.none")}
          </p>
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-status-warning/20 bg-status-warning-bg px-4 py-3 type-caption text-status-warning">
        {t("dashboard.agentOnboarding.noAutoCreation")}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {onboarding.nextSteps.map((step) => (
          <article
            className="flex min-h-[168px] flex-col justify-between rounded-[18px] border border-calm-hairline bg-white p-5"
            key={step.labelKey}
          >
            <div>
              <p className="type-caption-strong text-action-blue">
                {t(step.labelKey)}
              </p>
              <p className="type-caption mt-2 text-calm-ink-muted-80">
                {t(step.metaKey)}
              </p>
            </div>
            <button
              className="mt-5 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-full border border-calm-hairline bg-canvas-parchment px-4 type-caption-strong text-calm-ink-muted-48"
              disabled
              type="button"
            >
              {t("dashboard.agentOnboarding.comingSoon")}
            </button>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-calm-hairline bg-white px-4 py-3">
        <p className="type-caption-strong text-calm-ink">
          {t("dashboard.agentOnboarding.securityTitle")}
        </p>
        <p className="type-caption mt-2 text-calm-ink-muted-80">
          {t("dashboard.agentOnboarding.securityBody")}
        </p>
      </div>
    </section>
  );
}

export function DashboardOverviewPage({ data }: { data: DashboardOverviewData }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <RoleHero data={data} />

      {data.supplierOnboarding ? (
        <SupplierOnboardingPlaceholder onboarding={data.supplierOnboarding} />
      ) : null}

      {data.agentOnboarding ? (
        <AgentOnboardingPlaceholder onboarding={data.agentOnboarding} />
      ) : null}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.primaryActions")}
            </p>
            <h2 className="type-tagline mt-2 text-calm-ink">{t("dashboard.quickActions")}</h2>
          </div>
          <Link className="pill-secondary" href="/dashboard/account">
            {t("dashboard.account.edit")}
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {data.quickActions.map((action, index) => (
            <QuickActionCard
              action={action}
              key={getDashboardQuickActionKey(action, index, "overview-quick-action")}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.todayFocus")}</p>
              <h2 className="type-tagline mt-1 text-calm-ink">{t("dashboard.workQueue")}</h2>
            </div>
            <Badge dot={false} tone="neutral">
              {data.workItems.length}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.workItems.length > 0 ? (
              data.workItems.map((item, index) => (
                <RecordCard key={getDashboardRecordKey(item, index, "work-item")} record={item} />
              ))
            ) : (
              <EmptyState labelKey="dashboard.workQueue.empty" />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.statusBoard")}</p>
              <h2 className="type-tagline mt-1 text-calm-ink">{t("dashboard.recentActivities")}</h2>
            </div>
            <Badge dot={false} tone="neutral">
              {data.activities.length}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.activities.length > 0 ? (
              data.activities.map((item, index) => (
                <RecordCard key={getDashboardRecordKey(item, index, "activity")} record={item} />
              ))
            ) : (
              <EmptyState labelKey="dashboard.activities.empty" />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function DashboardAccountPage({
  data,
  errorMessage,
  noticeMessage,
}: {
  data: DashboardAccountData;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}) {
  const { context } = data;
  const displayName = context.displayName ?? context.email;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const completionLabel = `${data.completion.completed}/${data.completion.total}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey="dashboard.account.description"
        eyebrowKey="dashboard.eyebrow"
        titleKey="dashboard.account.title"
      />

      <NoticeMessage message={noticeMessage} tone="positive" />
      <NoticeMessage message={errorMessage} tone="negative" />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[26px] border border-calm-hairline bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_58%,#edf5ff_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-action-blue text-[1.6rem] font-semibold text-white">
                {avatarInitial}
              </div>
              <div>
                <p className="type-caption-strong text-action-blue">{t("dashboard.account.profile.title")}</p>
                <h2 className="type-heading-md mt-1 text-calm-ink">{displayName}</h2>
                <p className="type-caption text-calm-ink-muted-64">{context.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={data.approvalStatus} />
              <StatusBadge value={context.activityStatus} />
            </div>
          </div>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-calm-hairline bg-white/75 p-4">
              <dt className="type-fine-print text-calm-ink-muted-48">{t("dashboard.account.uid")}</dt>
              <dd className="mt-1 break-all type-caption-strong text-calm-ink">{context.profileId}</dd>
            </div>
            <div className="rounded-2xl border border-calm-hairline bg-white/75 p-4">
              <dt className="type-fine-print text-calm-ink-muted-48">{t("dashboard.account.memberType")}</dt>
              <dd className="mt-1 type-caption-strong text-calm-ink">{context.memberTypeCode}</dd>
            </div>
            <div className="rounded-2xl border border-calm-hairline bg-white/75 p-4">
              <dt className="type-fine-print text-calm-ink-muted-48">{t("dashboard.account.country")}</dt>
              <dd className="mt-1 type-caption-strong text-calm-ink">
                {data.countryName ?? t("dashboard.account.notSet")}
              </dd>
            </div>
            <div className="rounded-2xl border border-calm-hairline bg-white/75 p-4">
              <dt className="type-fine-print text-calm-ink-muted-48">{t("dashboard.account.createdAt")}</dt>
              <dd className="mt-1 type-caption-strong text-calm-ink">
                {data.createdAt ?? t("dashboard.account.notSet")}
              </dd>
            </div>
          </dl>
        </article>

        <form
          action={updateProfile}
          className="rounded-[26px] border border-calm-hairline bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8"
          data-action-confirm="true"
          data-confirm-message={t("feedback.account.save.confirm")}
          data-pending-message={t("feedback.pending.save")}
          data-success-message={t("feedback.success.save")}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge dot={false} tone="info">
                {t("dashboard.account.edit")}
              </Badge>
              <h2 className="type-heading-sm mt-3 text-calm-ink">{t("dashboard.account.form.title")}</h2>
              <p className="type-caption mt-2 max-w-2xl text-calm-ink-muted-64">
                {t("dashboard.account.form.description")}
              </p>
            </div>
            <Badge dot={false} tone="neutral">
              {completionLabel}
            </Badge>
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label className="type-caption-strong text-calm-ink" htmlFor="account-email">
                {t("auth.email")}
              </label>
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-calm-hairline bg-canvas-parchment px-4 type-body text-calm-ink-muted-48"
                disabled
                id="account-email"
                type="email"
                value={context.email}
              />
            </div>

            <div>
              <label className="type-caption-strong text-calm-ink" htmlFor="account-display-name">
                {t("auth.displayName")}
              </label>
              <input
                autoComplete="name"
                className="mt-2 min-h-12 w-full rounded-lg border border-calm-hairline px-4 type-body text-calm-ink outline-none focus:border-action-blue"
                defaultValue={context.displayName ?? ""}
                id="account-display-name"
                name="displayName"
                placeholder={t("auth.displayName.placeholder")}
                required
                type="text"
              />
            </div>

            <div>
              <label className="type-caption-strong text-calm-ink" htmlFor="account-phone">
                {t("dashboard.account.phone")}
              </label>
              <input
                autoComplete="tel"
                className="mt-2 min-h-12 w-full rounded-lg border border-calm-hairline px-4 type-body text-calm-ink outline-none focus:border-action-blue"
                defaultValue={data.phone ?? ""}
                id="account-phone"
                name="phone"
                placeholder={t("dashboard.account.phone.placeholder")}
                type="tel"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="type-caption-strong text-calm-ink" htmlFor="account-country">
                  {t("dashboard.account.country")}
                </label>
                <select
                  className="mt-2 min-h-12 w-full rounded-lg border border-calm-hairline bg-white px-4 type-body text-calm-ink outline-none focus:border-action-blue"
                  defaultValue={data.countryId ?? ""}
                  id="account-country"
                  name="countryId"
                >
                  <option value="">{t("dashboard.account.country.placeholder")}</option>
                  {data.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="type-caption-strong text-calm-ink" htmlFor="account-language">
                  {t("dashboard.account.language")}
                </label>
                <select
                  className="mt-2 min-h-12 w-full rounded-lg border border-calm-hairline bg-white px-4 type-body text-calm-ink outline-none focus:border-action-blue"
                  defaultValue={data.primaryLanguage ?? ""}
                  id="account-language"
                  name="primaryLanguage"
                >
                  <option value="">{t("dashboard.account.language.placeholder")}</option>
                  {data.languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-calm-hairline pt-5">
            <button className="pill-primary min-w-40" type="submit">
              {t("dashboard.account.save")}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-calm-hairline bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.account.completion.title")}</p>
              <h2 className="type-heading-sm mt-2 text-calm-ink">
                {t("dashboard.account.completion.summary")}
              </h2>
            </div>
            <Badge dot={false} tone="info">
              {completionLabel}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.completion.items.map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border border-calm-hairline bg-canvas-soft px-4 py-3"
                key={item.labelKey}
              >
                <div>
                  <p className="type-caption-strong text-calm-ink">{t(item.labelKey)}</p>
                  <p className="type-fine-print text-calm-ink-muted-48">
                    {item.meta ?? t("dashboard.account.notSet")}
                  </p>
                </div>
                <StatusBadge value={item.done ? "approved" : "pending"} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-calm-hairline bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.account.status.title")}</p>
              <h2 className="type-heading-sm mt-2 text-calm-ink">{t("dashboard.account.status.summary")}</h2>
            </div>
            <Badge dot={false} tone="neutral">
              {data.updatedAt ?? t("dashboard.account.notSet")}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {data.accountRecords.map((record, index) => (
              <RecordCard key={getDashboardRecordKey(record, index, "account-record")} record={record} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-calm-hairline bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.account.activity.title")}</p>
              <h2 className="type-heading-sm mt-2 text-calm-ink">{t("dashboard.account.activity.summary")}</h2>
            </div>
            <Badge dot={false} tone="neutral">
              {data.activityRecords.length}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.activityRecords.length > 0 ? (
              data.activityRecords.map((record, index) => (
                <RecordCard
                  key={getDashboardRecordKey(record, index, "account-activity")}
                  record={record}
                />
              ))
            ) : (
              <EmptyState labelKey="dashboard.account.activity.empty" />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-calm-hairline bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-caption-strong text-action-blue">{t("dashboard.account.quick.title")}</p>
              <h2 className="type-heading-sm mt-2 text-calm-ink">{t("dashboard.account.quick.summary")}</h2>
            </div>
            <Badge dot={false} tone="info">
              {data.quickActions.length}
            </Badge>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {data.quickActions.map((action, index) => (
              <QuickActionCard
                action={action}
                key={getDashboardQuickActionKey(action, index, "account-quick-action")}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function NoticeMessage({
  message,
  tone,
}: {
  message: string | null | undefined;
  tone: "negative" | "positive";
}) {
  if (!message) {
    return null;
  }

  const toneClass =
    tone === "positive"
      ? "border-status-positive/20 bg-status-positive-bg text-status-positive"
      : "border-status-negative/20 bg-status-negative-bg text-status-negative";

  return (
    <p className={`mt-6 rounded-2xl border px-5 py-4 type-caption-strong ${toneClass}`}>
      {message}
    </p>
  );
}

function SelectField({
  defaultValue,
  labelKey,
  name,
  options,
  required = false,
}: {
  defaultValue: string | null;
  labelKey: string;
  name: string;
  options: DashboardCompanyOption[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="type-caption-strong text-calm-ink-muted-80">{t(labelKey)}</span>
      <select
        className="min-h-12 rounded-[14px] border border-calm-hairline bg-white px-4 type-body text-calm-ink outline-none transition focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required}
      >
        <option value="">{t("dashboard.company.form.select")}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  defaultValue,
  labelKey,
  name,
  placeholderKey,
  required = false,
  type = "text",
}: {
  defaultValue: string | null;
  labelKey: string;
  name: string;
  placeholderKey: string;
  required?: boolean;
  type?: "text" | "url";
}) {
  return (
    <label className="grid gap-2">
      <span className="type-caption-strong text-calm-ink-muted-80">{t(labelKey)}</span>
      <input
        className="min-h-12 rounded-[14px] border border-calm-hairline bg-white px-4 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
        defaultValue={defaultValue ?? ""}
        name={name}
        placeholder={t(placeholderKey)}
        required={required}
        type={type}
      />
    </label>
  );
}

function CompanyIdentityCard({
  data,
  profile,
}: {
  data: DashboardCompanyData;
  profile: DashboardCompanyProfile;
}) {
  const metaItems = [
    {
      label: t("dashboard.company.field.country"),
      value: profile.countryName ?? t("dashboard.company.notAssigned"),
    },
    {
      label: t("dashboard.company.field.industry"),
      value: profile.industryName ?? profile.companyTypeName ?? t("dashboard.company.notAssigned"),
    },
    {
      label: t("dashboard.company.field.memberType"),
      value: data.context.memberTypeCode,
    },
  ];

  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-calm-hairline bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_52%,#eef6ff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <div className="flex min-h-[280px] flex-col justify-between">
          <div>
            <Badge dot={false} tone="info">
              {t(profile.scopeLabelKey)}
            </Badge>
            <h2 className="type-display-md mt-4 max-w-3xl text-calm-ink">{profile.title}</h2>
            <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
              {t("dashboard.company.heroDescription")}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <StatusBadge value={profile.status} />
            <StatusBadge value={profile.verificationStatus} />
            <StatusBadge value={profile.isActive ? "active" : "inactive"} />
            {profile.updatedAt ? (
              <span className="rounded-full bg-white/80 px-3 py-1 type-caption-strong text-calm-ink-muted-64 ring-1 ring-calm-hairline">
                {profile.updatedAt}
              </span>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[24px] border border-calm-hairline bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="grid gap-3">
            {metaItems.map((item) => (
              <dl
                className="grid gap-1 rounded-[18px] border border-calm-hairline bg-calm-surface px-4 py-3"
                key={item.label}
              >
                <dt className="type-caption text-calm-ink-muted-48">{item.label}</dt>
                <dd className="type-body-strong capitalize text-calm-ink">{item.value}</dd>
              </dl>
            ))}
          </div>
          {profile.publicHref ? (
            <Link className="pill-primary mt-4 w-full justify-center" href={profile.publicHref}>
              {t("dashboard.company.publicPage")}
            </Link>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function CompanyEditForm({ data }: { data: DashboardCompanyData }) {
  const { context, options, profile } = data;

  if (!profile) {
    return null;
  }

  if (context.memberTypeCode === "agent") {
    return (
      <section className="rounded-[24px] border border-action-blue/18 bg-white p-6 shadow-[0_18px_50px_rgba(0,102,204,0.06)]">
        <Badge dot={false} tone="info">
          {t("dashboard.company.agentScope")}
        </Badge>
        <h2 className="type-title-md mt-4 text-calm-ink">{t("dashboard.company.agentManagedTitle")}</h2>
        <p className="type-body mt-3 text-calm-ink-muted-80">{t("dashboard.company.agentManagedDescription")}</p>
        <Link className="pill-primary mt-6" href="/dashboard/referrals">
          {t("dashboard.company.openReferral")}
        </Link>
      </section>
    );
  }

  return (
    <form
      action={updateDashboardCompanyProfile}
      className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
      data-action-confirm="true"
      data-confirm-message={t("feedback.companyProfile.save.confirm")}
      data-confirm-title={t("feedback.confirm.title")}
      data-pending-message={t("feedback.pending.save")}
      data-success-message={t("feedback.success.save")}
    >
      <input name="memberType" type="hidden" value={context.memberTypeCode} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="type-caption-strong text-action-blue">{t("dashboard.company.form.eyebrow")}</p>
          <h2 className="type-title-md mt-2 text-calm-ink">{t("dashboard.company.form.title")}</h2>
        </div>
        <button className="pill-primary" type="submit">
          {t("dashboard.company.form.save")}
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {context.memberTypeCode === "supplier" || context.memberTypeCode === "buyer" ? (
          <>
            <TextField
              defaultValue={profile.companyName}
              labelKey="dashboard.company.field.companyName"
              name="companyName"
              placeholderKey="dashboard.company.field.companyNamePlaceholder"
              required
            />
            <SelectField
              defaultValue={profile.countryId}
              labelKey="dashboard.company.field.country"
              name="countryId"
              options={options.countries}
              required={context.memberTypeCode === "supplier"}
            />
          </>
        ) : null}

        {context.memberTypeCode === "supplier" ? (
          <>
            <SelectField
              defaultValue={profile.companyTypeId}
              labelKey="dashboard.company.field.companyType"
              name="companyTypeId"
              options={options.companyTypes}
              required
            />
            <SelectField
              defaultValue={profile.industryId}
              labelKey="dashboard.company.field.industry"
              name="industryId"
              options={options.industries}
              required
            />
            <TextField
              defaultValue={profile.website}
              labelKey="dashboard.company.field.website"
              name="website"
              placeholderKey="dashboard.company.field.websitePlaceholder"
              type="url"
            />
            <label className="grid gap-2 md:col-span-2">
              <span className="type-caption-strong text-calm-ink-muted-80">
                {t("dashboard.company.field.description")}
              </span>
              <textarea
                className="min-h-[132px] rounded-[14px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
                defaultValue={profile.description ?? ""}
                name="description"
                placeholder={t("dashboard.company.field.descriptionPlaceholder")}
                rows={5}
              />
            </label>
          </>
        ) : null}

        {context.memberTypeCode === "professor" || context.memberTypeCode === "student" ? (
          <TextField
            defaultValue={profile.companyName}
            labelKey="dashboard.company.field.universityName"
            name="universityName"
            placeholderKey="dashboard.company.field.universityNamePlaceholder"
            required
          />
        ) : null}
      </div>
    </form>
  );
}

function CompanyStatusPanel({ data }: { data: DashboardCompanyData }) {
  const checklist =
    data.verificationChecklist.length > 0
      ? data.verificationChecklist
      : [
          {
            done: data.profile?.isActive ?? false,
            labelKey: "dashboard.company.check.active",
            meta: data.profile?.status ?? null,
          },
          {
            done: Boolean(data.profile?.approvalStatus),
            labelKey: "dashboard.company.check.approval",
            meta: data.profile?.approvalStatus ?? null,
          },
        ];

  return (
    <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-caption-strong text-action-blue">{t("dashboard.company.status.eyebrow")}</p>
          <h2 className="type-title-md mt-2 text-calm-ink">{t("dashboard.company.status.title")}</h2>
        </div>
        <Badge dot={false} tone="info">
          {checklist.filter((item) => item.done).length}/{checklist.length}
        </Badge>
      </div>
      <div className="mt-5 grid gap-3">
        {checklist.map((item) => (
          <article
            className={`flex gap-3 rounded-[18px] border p-4 ${
              item.done
                ? "border-status-positive/20 bg-status-positive-bg/50"
                : "border-calm-hairline bg-calm-surface"
            }`}
            key={item.labelKey}
          >
            <span
              className={`mt-0.5 inline-flex h-7 shrink-0 items-center rounded-full px-3 type-fine-print ${
                item.done
                  ? "bg-status-positive-bg text-status-positive"
                  : "bg-white text-calm-ink-muted-64 ring-1 ring-calm-hairline"
              }`}
            >
              {item.done ? t("dashboard.company.done") : t("dashboard.company.pending")}
            </span>
            <div>
              <strong className="type-body-strong text-calm-ink">{t(item.labelKey)}</strong>
              {item.meta ? (
                <p className="type-caption mt-1 text-calm-ink-muted-64">
                  {item.meta.startsWith("dashboard.") ? t(item.meta) : item.meta}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardCompanyPage({
  data,
  errorMessage,
  noticeMessage,
}: {
  data: DashboardCompanyData;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}) {
  const profile = data.profile;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      <NoticeMessage message={noticeMessage} tone="positive" />
      <NoticeMessage message={errorMessage} tone="negative" />

      {profile ? <CompanyIdentityCard data={data} profile={profile} /> : null}

      <section
        className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={t("dashboard.company.metrics")}
      >
        {data.metrics.map((metric) => (
          <article
            className="rounded-[18px] border border-calm-hairline bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.035)]"
            key={metric.labelKey}
          >
            <strong className="type-title-md text-action-blue">{metric.value}</strong>
            <span className="mt-2 block type-caption-strong text-calm-ink-muted-64">
              {t(metric.labelKey)}
            </span>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <CompanyEditForm data={data} />
        <CompanyStatusPanel data={data} />
      </section>

      <section className="mt-6 rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="type-caption-strong text-action-blue">{t("dashboard.company.records.eyebrow")}</p>
            <h2 className="type-title-md mt-2 text-calm-ink">{t("dashboard.company.records.title")}</h2>
          </div>
          <Badge dot={false} tone="neutral">
            {data.records.length}
          </Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.records.length > 0 ? (
              data.records.map((record, index) => (
                <RecordCard key={getDashboardRecordKey(record, index, "company-record")} record={record} />
              ))
          ) : (
            <EmptyState labelKey={data.emptyKey} />
          )}
        </div>
      </section>
    </main>
  );
}

export function DashboardSectionPage({ data }: { data: DashboardSectionData }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.records.length > 0 ? (
          data.records.map((record, index) => (
            <RecordCard key={getDashboardRecordKey(record, index, "section-record")} record={record} />
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState labelKey={data.emptyKey} />
          </div>
        )}
      </section>
    </main>
  );
}

function ProductKindBadge({ kind }: { kind: DashboardProductRecord["kind"] }) {
  const tone =
    kind === "commercial" || kind === "sell-product"
      ? "info"
      : kind === "buy-request"
        ? "warning"
        : kind === "showcase" || kind === "market-research"
          ? "positive"
          : "neutral";

  return (
    <Badge dot={false} tone={tone}>
      {t(`dashboard.products.kind.${kind}`)}
    </Badge>
  );
}

function ProductRecordCard({ record }: { record: DashboardProductRecord }) {
  const card = (
    <article className="group flex min-h-[236px] flex-col rounded-[22px] border border-calm-hairline bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-action-blue/35 hover:shadow-[0_22px_56px_rgba(0,102,204,0.1)]">
      <div className="flex flex-wrap items-center gap-2">
        <ProductKindBadge kind={record.kind} />
        <StatusBadge value={record.status} />
      </div>
      <h3 className="type-body-strong mt-4 line-clamp-2 text-calm-ink transition group-hover:text-action-blue">
        {record.title}
      </h3>
      {record.description ? (
        <p className="type-caption mt-3 line-clamp-3 text-calm-ink-muted-64">
          {record.description}
        </p>
      ) : (
        <p className="type-caption mt-3 line-clamp-3 text-calm-ink-muted-48">
          {t("dashboard.products.record.noDescription")}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="type-fine-print text-calm-ink-muted-48">
          {record.meta ?? t("content.notAvailable")}
        </span>
        {record.href ? (
          <span className="inline-flex items-center gap-1 type-button-utility text-action-blue">
            {t("content.viewDetails")}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!record.href) {
    return card;
  }

  return (
    <Link className="block h-full" href={record.href}>
      {card}
    </Link>
  );
}

function StudentShowcasePanel({ data }: { data: DashboardStudentShowcaseData }) {
  const currentShowcase = data.currentShowcase;
  const canSubmit =
    currentShowcase?.status === "draft" || currentShowcase?.status === "rejected";
  const canCreateShowcase =
    data.availableProducts.length > 0 &&
    (!currentShowcase || currentShowcase.status === "approved");

  return (
    <section
      className="rounded-[24px] border border-action-blue/18 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
      id="student-showcase"
    >
      <Badge dot={false} tone="info">
        {t("dashboard.products.showcase.eyebrow")}
      </Badge>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="type-title-md text-calm-ink">
            {t("dashboard.products.showcase.title")}
          </h2>
          <p className="type-caption mt-2 max-w-2xl text-calm-ink-muted-64">
            {t("dashboard.products.showcase.description")}
          </p>
        </div>
        {currentShowcase ? <StatusBadge value={currentShowcase.status} /> : null}
      </div>

      <div className="mt-5 rounded-[18px] border border-action-blue/12 bg-action-blue/5 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.products.showcase.guideTitle")}
            </p>
            <p className="type-caption mt-1 max-w-2xl text-calm-ink-muted-64">
              {t("dashboard.products.showcase.guideDescription")}
            </p>
          </div>
          <Badge dot={false} tone={toneForStatus(currentShowcase?.status)}>
            {currentShowcase
              ? t("dashboard.products.showcase.statusInProgress")
              : t("dashboard.products.showcase.statusReady")}
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {STUDENT_SHOWCASE_STEPS.map((step) => (
            <article
              className="rounded-[16px] border border-white/80 bg-white p-4 shadow-[0_12px_28px_rgba(0,70,160,0.05)]"
              key={step.titleKey}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-action-blue text-[12px] font-semibold text-white">
                {step.number}
              </span>
              <h3 className="type-caption-strong mt-3 text-calm-ink">{t(step.titleKey)}</h3>
              <p className="type-fine-print mt-1 text-calm-ink-muted-64">
                {t(step.descriptionKey)}
              </p>
            </article>
          ))}
        </div>
      </div>

      {currentShowcase ? (
        <article className="mt-5 rounded-[18px] border border-calm-hairline bg-calm-surface p-5">
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.products.showcase.current")}
          </p>
          <h3 className="type-body-strong mt-2 text-calm-ink">{currentShowcase.title}</h3>
          <p className="type-caption mt-2 line-clamp-3 text-calm-ink-muted-64">
            {currentShowcase.description ?? t("dashboard.products.record.noDescription")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge dot={false} tone="neutral">
              {t("dashboard.products.showcase.itemCount")} {currentShowcase.itemCount}
            </Badge>
            {currentShowcase.updatedAt ? (
              <Badge dot={false} tone="neutral">
                {currentShowcase.updatedAt.slice(0, 10)}
              </Badge>
            ) : null}
          </div>
          {canSubmit ? (
            <form
              action={submitDashboardStudentShowcase}
              className="mt-5"
              data-action-confirm="true"
              data-confirm-message={t("feedback.showcase.submit.confirm")}
              data-confirm-title={t("feedback.confirm.title")}
              data-pending-message={t("feedback.pending.create")}
              data-success-message={t("feedback.success.create")}
            >
              <input name="showcaseId" type="hidden" value={currentShowcase.id} />
              <button className="pill-primary" type="submit">
                {t("dashboard.products.showcase.submitReview")}
              </button>
            </form>
          ) : (
            <p className="type-caption mt-4 text-calm-ink-muted-64">
              {t("dashboard.products.showcase.waitingReview")}
            </p>
          )}
        </article>
      ) : (
        <p className="mt-5 rounded-[18px] border border-dashed border-action-blue/20 bg-action-blue/5 p-5 type-caption text-calm-ink-muted-64">
          {t("dashboard.products.showcase.noCurrent")}
        </p>
      )}

      {canCreateShowcase ? (
        <form
          action={createDashboardStudentShowcase}
          className="mt-6 grid gap-5 rounded-[18px] border border-calm-hairline bg-white p-5"
          data-action-confirm="true"
          data-confirm-message={t("feedback.showcase.create.confirm")}
          data-confirm-title={t("feedback.confirm.title")}
          data-pending-message={t("feedback.pending.create")}
          data-success-message={t("feedback.success.create")}
        >
          <div>
            <h3 className="type-body-strong text-calm-ink">
              {t("dashboard.products.showcase.createTitle")}
            </h3>
            <p className="type-caption mt-1 text-calm-ink-muted-64">
              {t("dashboard.products.showcase.createDescription")}
            </p>
          </div>
          <TextField
            defaultValue={null}
            labelKey="dashboard.products.showcase.titleField"
            name="title"
            placeholderKey="dashboard.products.showcase.titlePlaceholder"
            required
          />
          <label className="grid gap-2">
            <span className="type-caption-strong text-calm-ink-muted-80">
              {t("dashboard.products.showcase.product")}
            </span>
            <select
              className="rounded-[14px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
              name="productId"
              required
            >
              <option value="">{t("dashboard.products.showcase.productPlaceholder")}</option>
              {data.availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="type-caption-strong text-calm-ink-muted-80">
              {t("dashboard.products.showcase.descriptionField")}
            </span>
            <textarea
              className="min-h-[112px] rounded-[14px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
              name="description"
              placeholder={t("dashboard.products.showcase.descriptionPlaceholder")}
              rows={4}
            />
          </label>
          <label className="grid gap-2">
            <span className="type-caption-strong text-calm-ink-muted-80">
              {t("dashboard.products.showcase.note")}
            </span>
            <textarea
              className="min-h-[96px] rounded-[14px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
              name="studentNote"
              placeholder={t("dashboard.products.showcase.notePlaceholder")}
              rows={3}
            />
          </label>
          <button className="pill-primary justify-center" type="submit">
            {t("dashboard.products.showcase.createSubmit")}
          </button>
        </form>
      ) : data.availableProducts.length === 0 ? (
        <p className="type-caption mt-5 text-calm-ink-muted-64">
          {t("dashboard.products.showcase.emptyProducts")}
        </p>
      ) : null}
    </section>
  );
}

function ProductCreateForm({
  canCreateProduct,
  studentShowcase,
}: {
  canCreateProduct: boolean;
  studentShowcase: DashboardStudentShowcaseData | null;
}) {
  if (studentShowcase) {
    return <StudentShowcasePanel data={studentShowcase} />;
  }

  if (!canCreateProduct) {
    return (
      <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <Badge dot={false} tone="info">
          {t("dashboard.products.readOnly.eyebrow")}
        </Badge>
        <h2 className="type-title-md mt-4 text-calm-ink">
          {t("dashboard.products.readOnly.title")}
        </h2>
        <p className="type-body mt-3 text-calm-ink-muted-80">
          {t("dashboard.products.readOnly.description")}
        </p>
      </section>
    );
  }

  return (
    <form
      action={createDashboardProduct}
      className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
      data-action-confirm="true"
      data-confirm-message={t("feedback.product.create.confirm")}
      data-confirm-title={t("feedback.confirm.title")}
      data-pending-message={t("feedback.pending.create")}
      data-success-message={t("feedback.success.create")}
      id="product-create"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.products.create.eyebrow")}
          </p>
          <h2 className="type-title-md mt-2 text-calm-ink">
            {t("dashboard.products.create.title")}
          </h2>
          <p className="type-caption mt-2 max-w-2xl text-calm-ink-muted-64">
            {t("dashboard.products.create.description")}
          </p>
        </div>
        <button className="pill-primary shrink-0" type="submit">
          {t("dashboard.products.create.submit")}
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        <TextField
          defaultValue={null}
          labelKey="dashboard.products.form.title"
          name="title"
          placeholderKey="dashboard.products.form.titlePlaceholder"
          required
        />
        <TextField
          defaultValue={null}
          labelKey="dashboard.products.form.summary"
          name="summary"
          placeholderKey="dashboard.products.form.summaryPlaceholder"
        />
        <label className="grid gap-2">
          <span className="type-caption-strong text-calm-ink-muted-80">
            {t("dashboard.products.form.description")}
          </span>
          <textarea
            className="min-h-[136px] rounded-[14px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10"
            name="description"
            placeholder={t("dashboard.products.form.descriptionPlaceholder")}
            rows={5}
          />
        </label>
      </div>
    </form>
  );
}

function formatActivityType(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function ActivityRecordCard({ record }: { record: DashboardActivityRecord }) {
  const card = (
    <article className="group relative overflow-hidden rounded-[20px] border border-calm-hairline bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-action-blue/35 hover:shadow-[0_20px_52px_rgba(0,102,204,0.09)]">
      <div className="absolute left-0 top-0 h-full w-1 bg-action-blue/70 opacity-0 transition group-hover:opacity-100" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 flex h-9 min-w-9 items-center justify-center rounded-full bg-action-blue/10 type-caption-strong text-action-blue">
            {record.activityType.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge dot={false} tone="info">
                {formatActivityType(record.activityType)}
              </Badge>
              {record.target ? (
                <Badge dot={false} tone="neutral">
                  {record.target}
                </Badge>
              ) : null}
            </div>
            <h3 className="type-body-strong mt-3 line-clamp-2 text-calm-ink transition group-hover:text-action-blue">
              {record.title}
            </h3>
            <p className="type-caption mt-2 line-clamp-2 text-calm-ink-muted-64">
              {record.detail ?? t("dashboard.activities.record.noDetail")}
            </p>
          </div>
        </div>
        <span className="shrink-0 type-fine-print text-calm-ink-muted-48">{record.meta}</span>
      </div>
      {record.href ? (
        <span className="mt-4 inline-flex items-center gap-1 type-button-utility text-action-blue">
          {t("content.viewDetails")}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      ) : null}
    </article>
  );

  if (!record.href) {
    return card;
  }

  return (
    <Link className="block" href={record.href}>
      {card}
    </Link>
  );
}

export function DashboardActivitiesPage({ data }: { data: DashboardActivitiesData }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      <section className="mt-8 overflow-hidden rounded-[28px] border border-action-blue/16 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_50%,#edf6ff_100%)] p-6 shadow-[0_24px_70px_rgba(0,102,204,0.08)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Badge dot={false} tone="info">
              {t("dashboard.activities.hero.eyebrow")}
            </Badge>
            <h2 className="type-display-md mt-4 max-w-3xl text-calm-ink">
              {t("dashboard.activities.hero.title")}
            </h2>
            <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
              {t("dashboard.activities.hero.description")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.metrics.map((metric) => (
              <article
                className="rounded-[18px] border border-action-blue/12 bg-white/84 p-5 shadow-[0_12px_34px_rgba(15,23,42,0.035)]"
                key={metric.labelKey}
              >
                <strong className="type-title-md text-action-blue">{metric.value}</strong>
                <span className="mt-2 block type-caption-strong text-calm-ink-muted-64">
                  {t(metric.labelKey)}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-caption-strong text-action-blue">
                {t("dashboard.activities.timeline.eyebrow")}
              </p>
              <h2 className="type-title-md mt-2 text-calm-ink">
                {t("dashboard.activities.timeline.title")}
              </h2>
            </div>
            <Badge dot={false} tone="neutral">
              {data.records.length}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.records.length > 0 ? (
              data.records.map((record) => <ActivityRecordCard key={record.id} record={record} />)
            ) : (
              <EmptyState labelKey={data.emptyKey} />
            )}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.activities.stage.eyebrow")}
            </p>
            <h2 className="type-title-md mt-2 text-calm-ink">
              {t("dashboard.activities.stage.title")}
            </h2>
            <div className="mt-5 grid gap-3">
              {data.stages.map((stage, index) => (
                <article
                  className="flex gap-3 rounded-[18px] border border-calm-hairline bg-calm-surface p-4"
                  key={stage.labelKey}
                >
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-action-blue/10 type-caption-strong text-action-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-body-strong text-calm-ink">{t(stage.labelKey)}</h3>
                      <StatusBadge value={stage.status} />
                      <Badge dot={false} tone="neutral">
                        {stage.count}
                      </Badge>
                    </div>
                    <p className="type-caption mt-1 text-calm-ink-muted-64">
                      {t(stage.descriptionKey)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.activities.coverage.eyebrow")}
            </p>
            <h2 className="type-title-md mt-2 text-calm-ink">
              {t("dashboard.activities.coverage.title")}
            </h2>
            <div className="mt-5 grid gap-3">
              {data.activityTypes.length > 0 ? (
                data.activityTypes.map((metric) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-calm-hairline bg-white px-4 py-3"
                    key={metric.labelKey}
                  >
                    <span className="type-caption-strong text-calm-ink-muted-80">
                      {formatActivityType(metric.labelKey)}
                    </span>
                    <Badge dot={false} tone="info">
                      {metric.value}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyState labelKey="dashboard.activities.coverage.empty" />
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.activities.guide.eyebrow")}
            </p>
            <h2 className="type-title-md mt-2 text-calm-ink">
              {t("dashboard.activities.guide.title")}
            </h2>
            <div className="mt-5 grid gap-3">
              {data.guide.map((item, index) => (
                <RecordCard key={getDashboardRecordKey(item, index, "activity-guide")} record={item} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

export function DashboardProductsPage({
  data,
  errorMessage,
  noticeMessage,
}: {
  data: DashboardProductsData;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      <NoticeMessage message={noticeMessage} tone="positive" />
      <NoticeMessage message={errorMessage} tone="negative" />

      <section className="mt-8 overflow-hidden rounded-[28px] border border-action-blue/16 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_50%,#eaf4ff_100%)] p-6 shadow-[0_24px_70px_rgba(0,102,204,0.08)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <Badge dot={false} tone="info">
              {t("dashboard.products.hero.eyebrow")}
            </Badge>
            <h2 className="type-display-md mt-4 max-w-3xl text-calm-ink">
              {t("dashboard.products.hero.title")}
            </h2>
            <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
              {t("dashboard.products.hero.description")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {data.quickActions.map((action, index) => (
                <Link
                  className="pill-secondary"
                  href={action.href}
                  key={getDashboardQuickActionKey(action, index, "products-quick-action")}
                >
                  {t(action.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.metrics.map((metric) => (
              <article
                className="rounded-[18px] border border-action-blue/12 bg-white/80 p-5 shadow-[0_12px_34px_rgba(15,23,42,0.035)]"
                key={metric.labelKey}
              >
                <strong className="type-title-md text-action-blue">{metric.value}</strong>
                <span className="mt-2 block type-caption-strong text-calm-ink-muted-64">
                  {t(metric.labelKey)}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <ProductCreateForm
          canCreateProduct={data.canCreateProduct}
          studentShowcase={data.studentShowcase}
        />
        <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.products.checklist.eyebrow")}
          </p>
          <h2 className="type-title-md mt-2 text-calm-ink">
            {t("dashboard.products.checklist.title")}
          </h2>
          <div className="mt-5 grid gap-3">
            {data.checklist.map((item, index) => (
              <article
                className="flex gap-3 rounded-[18px] border border-calm-hairline bg-calm-surface p-4"
                key={item.titleKey}
              >
                <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-action-blue/10 type-caption-strong text-action-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="type-body-strong text-calm-ink">{t(item.titleKey)}</h3>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="type-caption mt-1 text-calm-ink-muted-64">
                    {t(item.descriptionKey)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-6 rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.products.records.eyebrow")}
            </p>
            <h2 className="type-title-md mt-2 text-calm-ink">
              {t("dashboard.products.records.title")}
            </h2>
          </div>
          <Badge dot={false} tone="neutral">
            {data.records.length}
          </Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.records.length > 0 ? (
            data.records.map((record) => (
              <ProductRecordCard
                key={`${record.kind}:${record.title}:${record.updatedAt}`}
                record={record}
              />
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState labelKey={data.emptyKey} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatMessageDate(value: string | null | undefined): string {
  if (!value) {
    return t("dashboard.messages.notAvailable");
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ConversationListItem({
  conversation,
  selected,
}: {
  conversation: DashboardConversation;
  selected: boolean;
}) {
  return (
    <Link
      aria-current={selected ? "page" : undefined}
      className={`dashboard-message-list-item${selected ? " is-selected" : ""}`}
      href={`/dashboard/messages?conversation=${conversation.id}`}
    >
      <div className="dashboard-message-list-top">
        <div>
          <p>{conversation.subject}</p>
          <span>{formatMessageDate(conversation.updatedAt)}</span>
        </div>
        {conversation.unreadCount > 0 ? (
          <strong>{conversation.unreadCount}</strong>
        ) : (
          <StatusBadge value={conversation.status} />
        )}
      </div>
      <p className="dashboard-message-preview">
        {conversation.lastMessage?.body ?? t("dashboard.messages.noMessages")}
      </p>
    </Link>
  );
}

export function DashboardMessagesPage({
  data,
  errorMessage,
  noticeMessage,
}: {
  data: DashboardMessagesData;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}) {
  const selectedConversation = data.selectedConversation;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      {noticeMessage ? (
        <p className="mt-6 rounded-2xl border border-status-positive/20 bg-status-positive-bg px-5 py-4 type-caption-strong text-status-positive">
          {noticeMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-6 rounded-2xl border border-status-negative/20 bg-status-negative-bg px-5 py-4 type-caption-strong text-status-negative">
          {errorMessage}
        </p>
      ) : null}

      <section className="dashboard-message-metrics" aria-label={t("dashboard.messages.metrics")}>
        {data.metrics.map((metric) => (
          <article key={metric.labelKey}>
            <strong>{metric.value}</strong>
            <span>{t(metric.labelKey)}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-message-shell">
        <aside className="dashboard-message-inbox" aria-label={t("dashboard.messages.inbox")}>
          <div className="dashboard-message-panel-head">
            <div>
              <p>{t("dashboard.messages.inbox")}</p>
              <h2>{t("dashboard.messages.threadList")}</h2>
            </div>
            <Badge dot={false} tone="info">
              {data.conversations.length}
            </Badge>
          </div>

          <div className="dashboard-message-list">
            {data.conversations.length > 0 ? (
              data.conversations.map((conversation) => (
                <ConversationListItem
                  conversation={conversation}
                  key={conversation.id}
                  selected={conversation.id === data.selectedConversationId}
                />
              ))
            ) : (
              <EmptyState labelKey={data.emptyKey} />
            )}
          </div>
        </aside>

        <section className="dashboard-message-thread" aria-label={t("dashboard.messages.thread")}>
          {selectedConversation ? (
            <>
              <div className="dashboard-message-thread-head">
                <div>
                  <p>{t("dashboard.messages.thread")}</p>
                  <h2>{selectedConversation.subject}</h2>
                  <span>
                    {selectedConversation.participants.length}{" "}
                    {t("dashboard.messages.participants")}
                  </span>
                </div>
                <StatusBadge value={selectedConversation.status} />
              </div>

              <div className="dashboard-message-participants">
                {selectedConversation.participants.map((participant) => (
                  <span key={participant.profileId}>
                    {participant.displayName}
                    {participant.isCurrentUser ? ` · ${t("dashboard.messages.you")}` : ""}
                  </span>
                ))}
              </div>

              <div className="dashboard-message-timeline">
                {selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((message) => (
                    <article
                      className={`dashboard-message-bubble${message.isMine ? " is-mine" : ""}`}
                      key={message.id}
                    >
                      <div>
                        <strong>{message.senderName}</strong>
                        <span>{formatMessageDate(message.createdAt)}</span>
                      </div>
                      <p>
                        {message.blockedAt
                          ? t("dashboard.messages.blockedBody")
                          : message.body}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState labelKey="dashboard.messages.noMessages" />
                )}
              </div>

              {selectedConversation.isBlocked ? (
                <div className="dashboard-message-compose-disabled">
                  {t("dashboard.messages.blocked")}
                </div>
              ) : (
                <form
                  action={sendDashboardMessage}
                  className="dashboard-message-compose"
                  data-action-confirm="true"
                  data-confirm-message={t("feedback.message.send.confirm")}
                  data-confirm-title={t("feedback.confirm.title")}
                  data-pending-message={t("feedback.message.send.pending")}
                  data-success-message={t("feedback.message.send.success")}
                >
                  <input name="conversationId" type="hidden" value={selectedConversation.id} />
                  <label htmlFor="dashboard-message-body">
                    {t("dashboard.messages.compose")}
                  </label>
                  <textarea
                    id="dashboard-message-body"
                    name="body"
                    placeholder={t("dashboard.messages.composePlaceholder")}
                    required
                    rows={4}
                  />
                  <button className="pill-primary" type="submit">
                    {t("dashboard.messages.send")}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="dashboard-message-empty-thread">
              <h2>{t("dashboard.messages.noThreadTitle")}</h2>
              <p>{t("dashboard.messages.noThreadDescription")}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export function DashboardReferralPage({
  data,
  errorMessage,
  noticeMessage,
}: {
  data: DashboardReferralData;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        descriptionKey={data.descriptionKey}
        eyebrowKey="dashboard.eyebrow"
        titleKey={data.titleKey}
      />

      {noticeMessage ? (
        <p className="mt-6 rounded-2xl border border-status-positive/20 bg-status-positive-bg px-5 py-4 type-caption-strong text-status-positive">
          {noticeMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-6 rounded-2xl border border-status-negative/20 bg-status-negative-bg px-5 py-4 type-caption-strong text-status-negative">
          {errorMessage}
        </p>
      ) : null}

      <section className="dashboard-referral-hero">
        <div className="dashboard-referral-copy">
          <Badge dot={false} tone="info">
            {t(data.roleLabelKey)}
          </Badge>
          <h2>{t("dashboard.referrals.workspace.title")}</h2>
          <p>{t("dashboard.referrals.workspace.description")}</p>
          <div className="dashboard-referral-metrics">
            {data.summaryCards.length > 0 ? (
              data.summaryCards.map((metric) => (
                <article key={metric.labelKey}>
                  <strong>{metric.value}</strong>
                  <span>{t(metric.labelKey)}</span>
                </article>
              ))
            ) : (
              <article>
                <strong>{data.records.length}</strong>
                <span>{t("dashboard.referrals.metric.connected")}</span>
              </article>
            )}
          </div>
        </div>

        <aside className="dashboard-referral-code-card">
          <div className="dashboard-referral-code-head">
            <div>
              <p className="type-caption-strong text-action-blue">
                {t("dashboard.referrals.code.title")}
              </p>
              <h3>{t("dashboard.referrals.share.title")}</h3>
            </div>
            {data.activeCode ? <StatusBadge value={data.activeCode.isActive ? "active" : "inactive"} /> : null}
          </div>
          {data.activeCode ? (
            <>
              <div className="dashboard-referral-code-value">
                <span>{data.activeCode.code}</span>
              </div>
              <p className="dashboard-referral-url">
                {data.activeCode.referralUrl ?? t("dashboard.referrals.code.urlPending")}
              </p>
              {data.activeCode.referralUrl ? (
                <ReferralQrCard code={data.activeCode.code} url={data.activeCode.referralUrl} />
              ) : null}
              <div className="dashboard-referral-actions">
                <CopyReferralButton
                  label={t("dashboard.referrals.copy.code")}
                  value={data.activeCode.code}
                />
                {data.activeCode.referralUrl ? (
                  <>
                    <CopyReferralButton
                      label={t("dashboard.referrals.copy.link")}
                      value={data.activeCode.referralUrl}
                    />
                    <ReferralShareButton
                      text={t("dashboard.referrals.share.text")}
                      title={t("dashboard.referrals.share.title")}
                      url={data.activeCode.referralUrl}
                    />
                  </>
                ) : null}
              </div>
              <p className="dashboard-referral-ready-note">
                {t("dashboard.referrals.code.ready")}
              </p>
            </>
          ) : (
            <>
              <p className="dashboard-referral-empty-note">
                {data.canGenerateCode
                  ? t("dashboard.referrals.code.emptyBuyer")
                  : t("dashboard.referrals.code.emptyRole")}
              </p>
              {data.canGenerateCode ? (
                <form
                  action={generateReferralCode}
                  className="mt-4"
                  data-action-confirm="true"
                  data-confirm-message={t("dashboard.referrals.generate.confirm")}
                  data-pending-message={t("dashboard.referrals.generate.pending")}
                  data-success-message={t("dashboard.referrals.generate.success")}
                >
                  <button className="pill-primary w-full" type="submit">
                    {t("dashboard.referrals.generate.create")}
                  </button>
                </form>
              ) : null}
            </>
          )}
        </aside>
      </section>

      {data.mentorContact ? <ReferralMentorCard contact={data.mentorContact} /> : null}
      {data.studentContacts.length > 0 ? (
        <ReferralStudentRoster contacts={data.studentContacts} />
      ) : null}

      <section className="dashboard-referral-guide">
        {data.inviteGuide.map((item, index) => (
          <article key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <StatusBadge value={item.status} />
              <h3>{item.title.startsWith("dashboard.") ? t(item.title) : item.title}</h3>
              <p>{item.meta?.startsWith("dashboard.") ? t(item.meta) : item.meta}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="dashboard-referral-grid">
        <ReferralLookupPanel emptyKey={data.emptyKey} records={data.records} />
        <ReferralTreeView emptyKey={data.emptyKey} tree={data.tree} />
      </div>
    </main>
  );
}
