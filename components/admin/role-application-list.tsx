import {
  approveRoleApplicationAction,
  rejectRoleApplicationAction,
} from "@/lib/actions/identity";
import { Badge, StatusBadge } from "@/components/shared/badge";
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
          <StatusBadge
            label={t(`admin.roleApplications.status.${application.status}`, "ko")}
            value={application.status}
          />
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
              {application.status}
            </dd>
          </div>
        </dl>

        <section className="mt-4 rounded-2xl border border-calm-hairline bg-white px-4 py-3">
          <h2 className="type-fine-print text-calm-ink-muted-48">
            {t("admin.roleApplications.reason", "ko")}
          </h2>
          <p className="mt-2 whitespace-pre-wrap break-words type-caption text-calm-ink-muted-80">
            {application.reason?.trim() || t("admin.roleApplications.noReason", "ko")}
          </p>
        </section>
      </div>

      <div className="grid gap-3 self-start rounded-2xl bg-canvas-parchment p-4">
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
          <input
            className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
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
