import Link from "next/link";
import {
  approveApprovalItemAction,
  rejectApprovalItemAction,
} from "@/lib/actions/admin-approval";
import { Badge, StatusBadge } from "@/components/shared/badge";
import { ArrowUpRightIcon } from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import type {
  ApprovalQueueItem,
  ApprovalQueueSection,
} from "@/lib/queries/admin-approvals";

type ApprovalWorkflowProps = {
  result: "approved" | "error" | "rejected" | null;
  sections: ApprovalQueueSection[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ResultBanner({ result }: { result: ApprovalWorkflowProps["result"] }) {
  if (!result) {
    return null;
  }

  const key =
    result === "approved"
      ? "admin.approval.result.approved"
      : result === "rejected"
        ? "admin.approval.result.rejected"
        : "admin.approval.result.error";
  const tone = result === "approved" ? "positive" : result === "rejected" ? "neutral" : "negative";

  return (
    <div className={`rounded-2xl border px-5 py-4 ${
      tone === "positive"
        ? "border-status-positive/20 bg-status-positive-bg text-status-positive"
        : tone === "negative"
          ? "border-status-negative/20 bg-status-negative-bg text-status-negative"
          : "border-calm-hairline bg-calm-divider-soft text-calm-ink-muted-80"
    }`}>
      <p className="type-caption-strong">{t(key, "ko")}</p>
    </div>
  );
}

function HiddenTargetInputs({ item }: { item: ApprovalQueueItem }) {
  return (
    <>
      <input name="targetId" type="hidden" value={item.id} />
      <input name="targetTable" type="hidden" value={item.targetTable} />
    </>
  );
}

function ApprovalItem({ item }: { item: ApprovalQueueItem }) {
  return (
    <article className="grid gap-5 border-t border-calm-hairline px-6 py-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge dot={false} tone="neutral">
            {t(item.targetLabelKey, "ko")}
          </Badge>
          <StatusBadge label={t(`admin.approval.status.${item.status}`, "ko")} value={item.status} />
        </div>
        <h3 className="type-body-strong mt-3 text-calm-ink">{item.title}</h3>
        <p className="type-caption mt-2 line-clamp-2 text-calm-ink-muted-80">
          {item.summary ?? t("admin.approval.noSummary", "ko")}
        </p>
        <dl className="mt-4 grid gap-3 type-fine-print text-calm-ink-muted-48 sm:grid-cols-2">
          <div>
            <dt className="type-caption-strong text-calm-ink-muted-80">
              {t("admin.approval.updatedAt", "ko")}
            </dt>
            <dd className="mt-1">{formatDate(item.updatedAt)}</dd>
          </div>
          <div>
            <dt className="type-caption-strong text-calm-ink-muted-80">
              {t("admin.approval.createdAt", "ko")}
            </dt>
            <dd className="mt-1">{formatDate(item.createdAt)}</dd>
          </div>
        </dl>
        {item.detailHref ? (
          <Link
            className="mt-4 inline-flex items-center gap-1 type-button-utility text-action-blue hover:text-action-blue-focus"
            href={item.detailHref}
          >
            {t("admin.approval.preview", "ko")}
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-3 self-start rounded-2xl bg-canvas-parchment p-4">
        <form
          action={approveApprovalItemAction}
          className="grid gap-2"
          data-action-confirm="true"
          data-confirm-message={t("feedback.approval.approve.confirm", "ko")}
          data-pending-message={t("feedback.pending.approve", "ko")}
          data-success-message={t("feedback.success.approve", "ko")}
        >
          <HiddenTargetInputs item={item} />
          <input
            className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
            maxLength={1000}
            name="reason"
            placeholder={t("admin.approval.reasonPlaceholder", "ko")}
          />
          <button className="pill-primary w-full" type="submit">
            {t("admin.approval.approve", "ko")}
          </button>
        </form>

        <form
          action={rejectApprovalItemAction}
          className="grid gap-2"
          data-action-confirm="true"
          data-confirm-message={t("feedback.approval.reject.confirm", "ko")}
          data-confirm-tone="danger"
          data-pending-message={t("feedback.pending.reject", "ko")}
          data-success-message={t("feedback.success.reject", "ko")}
        >
          <HiddenTargetInputs item={item} />
          <input
            className="min-h-10 rounded-lg border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
            maxLength={1000}
            name="reason"
            placeholder={t("admin.approval.reasonPlaceholder", "ko")}
          />
          <button
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
            type="submit"
          >
            {t("admin.approval.reject", "ko")}
          </button>
        </form>
      </div>
    </article>
  );
}

export function ApprovalWorkflow({ result, sections }: ApprovalWorkflowProps) {
  const totalPending = sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  return (
    <main className="admin-page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.approval.eyebrow", "ko")}
          </Badge>
          <h1 className="type-display-md mt-3 text-calm-ink">{t("admin.approval.title", "ko")}</h1>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t("admin.approval.description", "ko")}
          </p>
        </div>
        <div className="rounded-2xl border border-calm-hairline bg-white px-5 py-4 text-right">
          <p className="type-caption text-calm-ink-muted-48">
            {t("admin.approval.totalPending", "ko")}
          </p>
          <p className="type-display-md mt-1 text-action-blue">{totalPending}</p>
        </div>
      </div>

      <div className="mt-6">
        <ResultBanner result={result} />
      </div>

      <div className="mt-8 grid gap-6">
        {sections.map((section) => (
          <section
            className="overflow-hidden rounded-[18px] border border-calm-hairline bg-white"
            key={section.targetTable}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-calm-hairline px-6 py-5">
              <h2 className="type-body-strong text-calm-ink">{t(section.targetLabelKey, "ko")}</h2>
              <Badge dot={false} tone={section.items.length > 0 ? "info" : "neutral"}>
                {section.items.length}
              </Badge>
            </div>
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <ApprovalItem item={item} key={`${item.targetTable}:${item.id}`} />
              ))
            ) : (
              <p className="type-caption px-6 py-8 text-calm-ink-muted-48">
                {t(section.emptyKey, "ko")}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
