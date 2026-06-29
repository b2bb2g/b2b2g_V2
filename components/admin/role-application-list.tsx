import {
  approveRoleApplicationAction,
  rejectRoleApplicationAction,
} from "@/lib/actions/identity";
import { Badge, type BadgeTone } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";
import type { AdminRoleApplicationRecord } from "@/lib/queries/identity";

type RoleApplicationListProps = {
  applications: AdminRoleApplicationRecord[];
  result: "approved" | "error" | "rejected" | null;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusTone(status: string): BadgeTone {
  if (status === "submitted") {
    return "info";
  }

  if (status === "under_review") {
    return "warning";
  }

  if (status === "approved") {
    return "positive";
  }

  if (status === "rejected") {
    return "negative";
  }

  return "neutral";
}

function getStatusLabel(status: string): string {
  return t(`admin.roleApplications.status.${status}`, "ko");
}

function ResultBanner({ result }: Pick<RoleApplicationListProps, "result">) {
  if (!result) {
    return null;
  }

  const tone =
    result === "approved" ? "positive" : result === "rejected" ? "neutral" : "negative";

  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        tone === "positive"
          ? "border-status-positive/20 bg-status-positive-bg text-status-positive"
          : tone === "negative"
            ? "border-status-negative/20 bg-status-negative-bg text-status-negative"
            : "border-calm-hairline bg-calm-divider-soft text-calm-ink-muted-80"
      }`}
    >
      <p className="type-caption-strong">
        {t(`admin.roleApplications.result.${result}`, "ko")}
      </p>
    </div>
  );
}

function HiddenApplicationId({ applicationId }: { applicationId: string }) {
  return <input name="applicationId" type="hidden" value={applicationId} />;
}

type SupplierApplicationSummary = {
  category: string | null;
  company: string | null;
  country: string | null;
  invitation: string | null;
  productSummary: string | null;
  website: string | null;
};

const supplierReasonLabels: Record<keyof SupplierApplicationSummary, string> = {
  category: "Category",
  company: "Company",
  country: "Country",
  invitation: "Invitation",
  productSummary: "Product summary",
  website: "Website",
};

function parseSupplierReason(reason: string | null): SupplierApplicationSummary | null {
  if (!reason?.trim().startsWith("Supplier application")) {
    return null;
  }

  const summary: SupplierApplicationSummary = {
    category: null,
    company: null,
    country: null,
    invitation: null,
    productSummary: null,
    website: null,
  };

  for (const line of reason.split("\n")) {
    const [rawLabel, ...rawValue] = line.split(":");
    const value = rawValue.join(":").trim();

    if (!value) {
      continue;
    }

    const normalizedLabel = rawLabel.trim();
    const key = Object.entries(supplierReasonLabels).find(
      ([, label]) => label === normalizedLabel,
    )?.[0] as keyof SupplierApplicationSummary | undefined;

    if (key) {
      summary[key] = value;
    }
  }

  return summary;
}

function SupplierApplicationReview({
  reason,
}: {
  reason: string | null;
}) {
  const summary = parseSupplierReason(reason);

  if (!summary) {
    return (
      <section className="mt-4 rounded-2xl border border-calm-hairline bg-white px-4 py-3">
        <h2 className="type-fine-print text-calm-ink-muted-48">
          {t("admin.roleApplications.reason", "ko")}
        </h2>
        <p className="mt-2 whitespace-pre-wrap break-words type-caption text-calm-ink-muted-80">
          {reason?.trim() || t("admin.roleApplications.noReason", "ko")}
        </p>
      </section>
    );
  }

  const fields: Array<{
    key: keyof SupplierApplicationSummary;
    labelKey: string;
  }> = [
    { key: "company", labelKey: "admin.roleApplications.supplier.company" },
    { key: "country", labelKey: "admin.roleApplications.supplier.country" },
    { key: "category", labelKey: "admin.roleApplications.supplier.category" },
    { key: "productSummary", labelKey: "admin.roleApplications.supplier.productSummary" },
    { key: "website", labelKey: "admin.roleApplications.supplier.website" },
    { key: "invitation", labelKey: "admin.roleApplications.supplier.invitation" },
  ];

  return (
    <section className="mt-4 rounded-2xl border border-action-blue/20 bg-action-blue/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-caption-strong text-calm-ink">
            {t("admin.roleApplications.supplier.title", "ko")}
          </h2>
          <p className="type-caption mt-2 text-calm-ink-muted-80">
            {t("admin.roleApplications.supplier.description", "ko")}
          </p>
        </div>
        <Badge dot={false} tone="warning">
          {t("admin.roleApplications.supplier.approvalNotice", "ko")}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {fields.map(({ key, labelKey }) => (
          <div
            className={key === "productSummary" ? "md:col-span-2" : ""}
            key={key}
          >
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t(labelKey, "ko")}
            </dt>
            <dd className="mt-1 break-words rounded-xl border border-calm-hairline bg-white px-3 py-2 type-caption text-calm-ink">
              {summary[key] || t("admin.roleApplications.supplier.notProvided", "ko")}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-xl border border-status-warning/20 bg-status-warning-bg px-4 py-3 type-caption text-status-warning">
        {t("admin.roleApplications.supplier.noAutoCreation", "ko")}
      </p>

      <details className="mt-4 rounded-xl border border-calm-hairline bg-white px-4 py-3">
        <summary className="cursor-pointer type-caption-strong text-calm-ink">
          {t("admin.roleApplications.rawReason", "ko")}
        </summary>
        <p className="mt-3 whitespace-pre-wrap break-words type-caption text-calm-ink-muted-80">
          {reason?.trim() || t("admin.roleApplications.noReason", "ko")}
        </p>
      </details>
    </section>
  );
}

function RoleApplicationItem({
  application,
}: {
  application: AdminRoleApplicationRecord;
}) {
  return (
    <article className="grid gap-5 border-t border-calm-hairline px-6 py-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge dot={false} tone="info">
            {application.requested_role_key}
          </Badge>
          <Badge tone={getStatusTone(application.status)}>
            {getStatusLabel(application.status)}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-4 type-caption sm:grid-cols-2">
          <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t("admin.roleApplications.accountId", "ko")}
            </dt>
            <dd className="mt-1 break-all type-caption-strong text-calm-ink">
              {application.account_id}
            </dd>
          </div>
          <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t("admin.roleApplications.createdAt", "ko")}
            </dt>
            <dd className="mt-1 type-caption-strong text-calm-ink">
              {formatDate(application.created_at)}
            </dd>
          </div>
          <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t("admin.roleApplications.requestedRole", "ko")}
            </dt>
            <dd className="mt-1 type-caption-strong text-calm-ink">
              {application.requested_role_key}
            </dd>
          </div>
          <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t("admin.roleApplications.status", "ko")}
            </dt>
            <dd className="mt-1 type-caption-strong text-calm-ink">
              {getStatusLabel(application.status)}
            </dd>
          </div>
        </dl>

        <SupplierApplicationReview reason={application.reason} />
      </div>

      <div className="grid gap-3 self-start rounded-2xl bg-canvas-parchment p-4">
        {application.requested_role_key === "supplier" ? (
          <p className="rounded-xl border border-status-warning/20 bg-white px-4 py-3 type-caption text-calm-ink-muted-80">
            {t("admin.roleApplications.supplier.approvalActionNotice", "ko")}
          </p>
        ) : null}

        <form
          action={approveRoleApplicationAction}
          className="grid gap-2"
          data-action-confirm="true"
          data-confirm-message={t("feedback.roleApplications.approve.confirm", "ko")}
          data-pending-message={t("feedback.pending.approve", "ko")}
          data-success-message={t("feedback.success.approve", "ko")}
        >
          <HiddenApplicationId applicationId={application.id} />
          <button className="pill-primary w-full" type="submit">
            {t("admin.roleApplications.approve", "ko")}
          </button>
        </form>

        <form
          action={rejectRoleApplicationAction}
          className="grid gap-2"
          data-action-confirm="true"
          data-confirm-message={t("feedback.roleApplications.reject.confirm", "ko")}
          data-confirm-tone="danger"
          data-pending-message={t("feedback.pending.reject", "ko")}
          data-success-message={t("feedback.success.reject", "ko")}
        >
          <HiddenApplicationId applicationId={application.id} />
          <label
            className="type-fine-print text-calm-ink-muted-80"
            htmlFor={`reject-reason-${application.id}`}
          >
            {t("admin.roleApplications.rejectReasonLabel", "ko")}
          </label>
          <input
            className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
            id={`reject-reason-${application.id}`}
            maxLength={1000}
            name="reason"
            placeholder={t("admin.roleApplications.rejectReasonPlaceholder", "ko")}
            required
          />
          <button
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
            type="submit"
          >
            {t("admin.roleApplications.reject", "ko")}
          </button>
        </form>
      </div>
    </article>
  );
}

export function RoleApplicationList({
  applications,
  result,
}: RoleApplicationListProps) {
  return (
    <main className="admin-page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.roleApplications.eyebrow", "ko")}
          </Badge>
          <h1 className="type-display-md mt-3 text-calm-ink">
            {t("admin.roleApplications.title", "ko")}
          </h1>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t("admin.roleApplications.description", "ko")}
          </p>
        </div>
        <div className="rounded-2xl border border-calm-hairline bg-white px-5 py-4 text-right">
          <p className="type-caption text-calm-ink-muted-48">
            {t("admin.roleApplications.totalPending", "ko")}
          </p>
          <p className="type-display-md mt-1 text-action-blue">{applications.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <ResultBanner result={result} />
      </div>

      <section className="mt-8 overflow-hidden rounded-[18px] border border-calm-hairline bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-calm-hairline px-6 py-5">
          <h2 className="type-body-strong text-calm-ink">
            {t("admin.roleApplications.pendingTitle", "ko")}
          </h2>
          <Badge dot={false} tone={applications.length > 0 ? "info" : "neutral"}>
            {applications.length}
          </Badge>
        </div>
        {applications.length > 0 ? (
          applications.map((application) => (
            <RoleApplicationItem application={application} key={application.id} />
          ))
        ) : (
          <p className="type-caption px-6 py-8 text-calm-ink-muted-48">
            {t("admin.roleApplications.empty", "ko")}
          </p>
        )}
      </section>
    </main>
  );
}
