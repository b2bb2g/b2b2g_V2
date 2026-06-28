"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  approveCompanyAction,
  rejectCompanyAction,
  suspendCompanyAction,
  verifyCompanyAction,
} from "@/lib/actions/admin-companies";
import { Badge, StatusBadge } from "@/components/shared/badge";
import { ArrowUpRightIcon } from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import type {
  AdminCompaniesData,
  AdminCompanyItem,
} from "@/lib/queries/admin-companies";

type CompanyManagementProps = AdminCompaniesData & {
  result: "approved" | "error" | "rejected" | "suspended" | "verified" | null;
};

const APPROVAL_OPTIONS = [
  "all",
  "draft",
  "submitted",
  "reviewing",
  "approved",
  "rejected",
  "suspended",
] as const;

const VERIFICATION_OPTIONS = [
  "all",
  "pending",
  "verified",
  "rejected",
  "suspended",
] as const;

function formatDate(value: string | null): string {
  if (!value) {
    return t("admin.companies.notAvailable", "ko");
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function resultTone(result: CompanyManagementProps["result"]) {
  if (result === "error") {
    return "border-status-negative/20 bg-status-negative-bg text-status-negative";
  }

  if (result === "rejected" || result === "suspended") {
    return "border-calm-hairline bg-calm-divider-soft text-calm-ink-muted-80";
  }

  return "border-status-positive/20 bg-status-positive-bg text-status-positive";
}

function ResultBanner({ result }: Pick<CompanyManagementProps, "result">) {
  if (!result) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-5 py-4 ${resultTone(result)}`}>
      <p className="type-caption-strong">
        {t(`admin.companies.result.${result}`, "ko")}
      </p>
    </div>
  );
}

function SummaryCard({
  labelKey,
  value,
}: {
  labelKey: string;
  value: number;
}) {
  return (
    <article className="rounded-[18px] border border-calm-hairline bg-white p-5">
      <p className="type-caption text-calm-ink-muted-48">{t(labelKey, "ko")}</p>
      <p className="type-display-md mt-2 text-calm-ink">{value}</p>
    </article>
  );
}

function HiddenCompanyId({ companyId }: { companyId: string }) {
  return <input name="companyId" type="hidden" value={companyId} />;
}

function ApprovalActions({ company }: { company: AdminCompanyItem }) {
  if (company.approvalStatus === "approved") {
    return null;
  }

  if (company.approvalStatus === "suspended") {
    return (
      <p className="type-caption text-calm-ink-muted-48">
        {t("admin.companies.actionSuspended", "ko")}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <form
        action={approveCompanyAction}
        className="grid gap-2"
        data-action-confirm="true"
        data-confirm-message={t("feedback.company.approve.confirm", "ko")}
        data-pending-message={t("feedback.pending.approve", "ko")}
        data-success-message={t("feedback.success.approve", "ko")}
      >
        <HiddenCompanyId companyId={company.id} />
        <input
          className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
          maxLength={1000}
          name="reason"
          placeholder={t("admin.companies.reasonPlaceholder", "ko")}
        />
        <button className="pill-primary w-full" type="submit">
          {t("admin.companies.approve", "ko")}
        </button>
      </form>

      <form
        action={rejectCompanyAction}
        className="grid gap-2"
        data-action-confirm="true"
        data-confirm-message={t("feedback.company.reject.confirm", "ko")}
        data-confirm-tone="danger"
        data-pending-message={t("feedback.pending.reject", "ko")}
        data-success-message={t("feedback.success.reject", "ko")}
      >
        <HiddenCompanyId companyId={company.id} />
        <input
          className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
          maxLength={1000}
          name="reason"
          placeholder={t("admin.companies.reasonPlaceholder", "ko")}
        />
        <button
          className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
          type="submit"
        >
          {t("admin.companies.reject", "ko")}
        </button>
      </form>
    </div>
  );
}

function VerificationActions({ company }: { company: AdminCompanyItem }) {
  if (company.approvalStatus !== "approved") {
    return (
      <p className="type-caption text-calm-ink-muted-48">
        {t("admin.companies.verifyNeedsApproval", "ko")}
      </p>
    );
  }

  if (company.verificationStatus === "verified") {
    return (
      <p className="type-caption text-status-positive">
        {t("admin.companies.alreadyVerified", "ko")}
      </p>
    );
  }

  return (
    <form
      action={verifyCompanyAction}
      className="grid gap-3"
      data-action-confirm="true"
      data-confirm-message={t("feedback.company.verify.confirm", "ko")}
      data-pending-message={t("feedback.pending.verify", "ko")}
      data-success-message={t("feedback.success.verify", "ko")}
    >
      <HiddenCompanyId companyId={company.id} />
      <div className="grid gap-2 type-caption text-calm-ink-muted-80 sm:grid-cols-2">
        {[
          ["businessRegistrationChecked", "admin.companies.check.business"],
          ["websiteChecked", "admin.companies.check.website"],
          ["catalogChecked", "admin.companies.check.catalog"],
          ["certificateChecked", "admin.companies.check.certificate"],
        ].map(([name, labelKey]) => (
          <label className="inline-flex items-center gap-2" key={name}>
            <input
              className="h-4 w-4 accent-action-blue"
              defaultChecked={
                company.lastVerification?.[
                  name as keyof NonNullable<AdminCompanyItem["lastVerification"]>
                ] !== false
              }
              name={name}
              type="checkbox"
            />
            {t(labelKey, "ko")}
          </label>
        ))}
      </div>
      <textarea
        className="min-h-20 rounded-lg border border-calm-hairline bg-white px-3 py-2 type-caption text-calm-ink outline-none focus:border-action-blue"
        maxLength={1000}
        name="reviewNote"
        placeholder={t("admin.companies.reviewNotePlaceholder", "ko")}
      />
      <button className="pill-primary w-full" type="submit">
        {t("admin.companies.verify", "ko")}
      </button>
    </form>
  );
}

function SuspendAction({ company }: { company: AdminCompanyItem }) {
  if (company.approvalStatus === "suspended") {
    return null;
  }

  return (
    <form
      action={suspendCompanyAction}
      className="grid gap-2"
      data-action-confirm="true"
      data-confirm-message={t("feedback.company.suspend.confirm", "ko")}
      data-confirm-tone="warning"
      data-pending-message={t("feedback.pending.suspend", "ko")}
      data-success-message={t("feedback.success.suspend", "ko")}
    >
      <HiddenCompanyId companyId={company.id} />
      <input
        className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
        maxLength={1000}
        name="reason"
        placeholder={t("admin.companies.suspendReasonPlaceholder", "ko")}
      />
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
        type="submit"
      >
        {t("admin.companies.suspend", "ko")}
      </button>
    </form>
  );
}

function CompanyRow({ company }: { company: AdminCompanyItem }) {
  return (
    <article className="grid gap-6 border-t border-calm-hairline px-6 py-6 xl:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={t(`admin.companies.approval.${company.approvalStatus}`, "ko")}
            value={company.approvalStatus}
          />
          <StatusBadge
            label={t(
              `admin.companies.verification.${company.verificationStatus}`,
              "ko",
            )}
            value={company.verificationStatus}
          />
          {company.isActive ? (
            <Badge tone="positive">{t("admin.companies.active", "ko")}</Badge>
          ) : (
            <Badge tone="negative">{t("admin.companies.inactive", "ko")}</Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="type-body-strong text-calm-ink">{company.name}</h2>
            <p className="type-caption mt-1 text-calm-ink-muted-48">
              /companies/{company.slug}
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1 type-button-utility text-action-blue hover:text-action-blue-focus"
            href={`/companies/${company.slug}`}
          >
            {t("admin.companies.preview", "ko")}
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="type-caption mt-4 line-clamp-2 max-w-3xl text-calm-ink-muted-80">
          {company.description ?? t("admin.companies.noDescription", "ko")}
        </p>

        <dl className="mt-5 grid gap-4 type-caption sm:grid-cols-2 xl:grid-cols-4">
          {([
            ["admin.companies.companyType", company.companyTypeName],
            ["admin.companies.country", company.countryName],
            ["admin.companies.industry", company.industryName],
            ["admin.companies.website", company.website],
          ] as [string, string | null][]).map(([labelKey, value]) => (
            <div key={labelKey}>
              <dt className="type-caption-strong text-calm-ink-muted-80">
                {t(labelKey, "ko")}
              </dt>
              <dd className="mt-1 break-words text-calm-ink-muted-48">
                {value ?? t("admin.companies.notAvailable", "ko")}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["admin.companies.suppliers", company.supplierCount],
            ["admin.companies.products", company.contentCounts.products],
            ["admin.companies.industrial", company.contentCounts.industrial],
            ["admin.companies.epc", company.contentCounts.epc],
          ].map(([labelKey, value]) => (
            <div
              className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3"
              key={labelKey}
            >
              <p className="type-fine-print text-calm-ink-muted-48">
                {t(String(labelKey), "ko")}
              </p>
              <p className="type-body-strong mt-1 text-calm-ink">{value}</p>
            </div>
          ))}
        </div>

        <dl className="mt-5 grid gap-4 type-caption sm:grid-cols-3">
          <div>
            <dt className="type-caption-strong text-calm-ink-muted-80">
              {t("admin.companies.updatedAt", "ko")}
            </dt>
            <dd className="mt-1 text-calm-ink-muted-48">
              {formatDate(company.updatedAt)}
            </dd>
          </div>
          <div>
            <dt className="type-caption-strong text-calm-ink-muted-80">
              {t("admin.companies.verifiedAt", "ko")}
            </dt>
            <dd className="mt-1 text-calm-ink-muted-48">
              {formatDate(company.verifiedAt)}
            </dd>
          </div>
          <div>
            <dt className="type-caption-strong text-calm-ink-muted-80">
              {t("admin.companies.lastReview", "ko")}
            </dt>
            <dd className="mt-1 text-calm-ink-muted-48">
              {formatDate(company.lastVerification?.reviewed_at ?? null)}
            </dd>
          </div>
        </dl>
      </div>

      <aside className="grid gap-4 self-start rounded-[18px] bg-canvas-parchment p-4">
        <section className="grid gap-3">
          <h3 className="type-caption-strong text-calm-ink">
            {t("admin.companies.approvalActions", "ko")}
          </h3>
          <ApprovalActions company={company} />
        </section>

        <section className="grid gap-3 border-t border-calm-hairline pt-4">
          <h3 className="type-caption-strong text-calm-ink">
            {t("admin.companies.verificationActions", "ko")}
          </h3>
          <VerificationActions company={company} />
        </section>

        <section className="grid gap-3 border-t border-calm-hairline pt-4">
          <h3 className="type-caption-strong text-calm-ink">
            {t("admin.companies.riskActions", "ko")}
          </h3>
          <SuspendAction company={company} />
        </section>
      </aside>
    </article>
  );
}

function matchesCompany(input: {
  approvalStatus: CompanyManagementProps["filters"]["approvalStatus"];
  company: AdminCompanyItem;
  query: string;
  verificationStatus: CompanyManagementProps["filters"]["verificationStatus"];
}): boolean {
  const normalizedQuery = input.query.trim().toLowerCase();
  const approvalMatches =
    input.approvalStatus === "all" ||
    input.company.approvalStatus === input.approvalStatus;
  const verificationMatches =
    input.verificationStatus === "all" ||
    input.company.verificationStatus === input.verificationStatus;

  if (!approvalMatches || !verificationMatches) {
    return false;
  }

  if (!normalizedQuery) {
    return true;
  }

  return [
    input.company.name,
    input.company.slug,
    input.company.description ?? "",
    input.company.website ?? "",
    input.company.companyTypeName ?? "",
    input.company.countryName ?? "",
    input.company.industryName ?? "",
    input.company.approvalStatus,
    input.company.verificationStatus,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function CompanyManagement({
  filters,
  items,
  result,
  summary,
}: CompanyManagementProps) {
  const [query, setQuery] = useState(filters.query);
  const [approvalStatus, setApprovalStatus] = useState(filters.approvalStatus);
  const [verificationStatus, setVerificationStatus] = useState(
    filters.verificationStatus,
  );
  const visibleItems = useMemo(
    () =>
      items.filter((company) =>
        matchesCompany({
          approvalStatus,
          company,
          query,
          verificationStatus,
        }),
      ),
    [approvalStatus, items, query, verificationStatus],
  );
  const hasActiveFilters =
    query.trim() !== "" ||
    approvalStatus !== "all" ||
    verificationStatus !== "all";

  function resetFilters() {
    setQuery("");
    setApprovalStatus("all");
    setVerificationStatus("all");
  }

  return (
    <main className="admin-page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.companies.eyebrow", "ko")}
          </Badge>
          <h1 className="type-display-md mt-3 text-calm-ink">
            {t("admin.companies.title", "ko")}
          </h1>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t("admin.companies.description", "ko")}
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-calm-hairline bg-white px-5 type-caption-strong text-calm-ink transition hover:border-action-blue/30 hover:text-action-blue"
          href="/admin"
        >
          {t("admin.companies.backToAdmin", "ko")}
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard labelKey="admin.companies.metric.total" value={summary.total} />
        <SummaryCard labelKey="admin.companies.metric.pending" value={summary.pendingApproval} />
        <SummaryCard labelKey="admin.companies.metric.approved" value={summary.approved} />
        <SummaryCard labelKey="admin.companies.metric.verified" value={summary.verified} />
        <SummaryCard labelKey="admin.companies.metric.suspended" value={summary.suspended} />
        <SummaryCard labelKey="admin.companies.metric.active" value={summary.active} />
      </section>

      <div className="mt-6">
        <ResultBanner result={result} />
      </div>

      <section className="mt-8 rounded-[18px] border border-calm-hairline bg-white p-5">
        <form
          className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="q"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t("admin.companies.searchPlaceholder", "ko")}
            type="search"
            value={query}
          />
          <select
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="approval"
            onChange={(event) => {
              setApprovalStatus(
                event.target
                  .value as CompanyManagementProps["filters"]["approvalStatus"],
              );
            }}
            value={approvalStatus}
          >
            {APPROVAL_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`admin.companies.approval.${status}`, "ko")}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="verification"
            onChange={(event) => {
              setVerificationStatus(
                event.target
                  .value as CompanyManagementProps["filters"]["verificationStatus"],
              );
            }}
            value={verificationStatus}
          >
            {VERIFICATION_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`admin.companies.verification.${status}`, "ko")}
              </option>
            ))}
          </select>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-calm-hairline px-6 type-caption-strong text-calm-ink transition hover:border-action-blue/30 hover:text-action-blue disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            type="button"
          >
            {t("admin.companies.reset", "ko")}
          </button>
          <p className="flex min-h-11 items-center justify-end type-caption text-calm-ink-muted-48 lg:text-right">
            {t("admin.companies.liveCount", "ko")
              .replace("{visible}", String(visibleItems.length))
              .replace("{total}", String(items.length))}
          </p>
        </form>
        <p className="type-fine-print mt-3 text-calm-ink-muted-48">
          {t("admin.companies.liveHint", "ko")}
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-[18px] border border-calm-hairline bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-calm-hairline px-6 py-5">
          <h2 className="type-body-strong text-calm-ink">
            {t("admin.companies.listTitle", "ko")}
          </h2>
          <Badge dot={false} tone={visibleItems.length > 0 ? "info" : "neutral"}>
            {visibleItems.length}
          </Badge>
        </div>
        {visibleItems.length > 0 ? (
          visibleItems.map((company) => (
            <CompanyRow company={company} key={company.id} />
          ))
        ) : (
          <p className="type-caption px-6 py-10 text-calm-ink-muted-48">
            {t("admin.companies.empty", "ko")}
          </p>
        )}
      </section>
    </main>
  );
}
