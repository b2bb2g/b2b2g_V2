import { revokeInvitationFormAction } from "@/lib/invitations/actions";
import { Badge, StatusBadge } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";
import type { InvitationAdminRecord } from "@/lib/invitations/types";

type InvitationListProps = {
  invitations: InvitationAdminRecord[];
  queryError: string | null;
  result: "error" | "revoked" | null;
};

function formatDate(value: string | null): string {
  if (!value) {
    return t("admin.invitations.notAvailable", "ko");
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ResultBanner({
  queryError,
  result,
}: Pick<InvitationListProps, "queryError" | "result">) {
  if (queryError) {
    return (
      <div className="rounded-2xl border border-status-negative/20 bg-status-negative-bg px-5 py-4 text-status-negative">
        <p className="type-caption-strong">
          {t("admin.invitations.result.queryError", "ko")}
        </p>
        <p className="mt-1 break-words type-caption">{queryError}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const tone =
    result === "revoked"
      ? "border-status-positive/20 bg-status-positive-bg text-status-positive"
      : "border-status-negative/20 bg-status-negative-bg text-status-negative";

  return (
    <div className={`rounded-2xl border px-5 py-4 ${tone}`}>
      <p className="type-caption-strong">
        {t(`admin.invitations.result.${result}`, "ko")}
      </p>
    </div>
  );
}

function InvitationMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
      <dt className="type-fine-print text-calm-ink-muted-48">{label}</dt>
      <dd className="mt-1 break-words type-caption-strong text-calm-ink">{value}</dd>
    </div>
  );
}

function RevokeForm({ invitation }: { invitation: InvitationAdminRecord }) {
  const canRevoke = invitation.status === "active" || invitation.status === "draft";

  if (!canRevoke) {
    return (
      <p className="type-caption text-calm-ink-muted-48">
        {t("admin.invitations.revoke.notAvailable", "ko")}
      </p>
    );
  }

  return (
    <form
      action={revokeInvitationFormAction}
      className="grid gap-2"
      data-action-confirm="true"
      data-confirm-message={t("admin.invitations.revoke.confirm", "ko")}
      data-confirm-tone="danger"
      data-pending-message={t("admin.invitations.revoke.pending", "ko")}
      data-success-message={t("admin.invitations.revoke.success", "ko")}
    >
      <input name="invitationId" type="hidden" value={invitation.id} />
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
        type="submit"
      >
        {t("admin.invitations.revoke.submit", "ko")}
      </button>
    </form>
  );
}

function InvitationItem({ invitation }: { invitation: InvitationAdminRecord }) {
  return (
    <article className="grid gap-5 border-t border-calm-hairline px-6 py-6 lg:grid-cols-[1fr_220px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge dot={false} tone="info">
            {invitation.invitationType}
          </Badge>
          <StatusBadge
            label={t(`admin.invitations.status.${invitation.status}`, "ko")}
            value={invitation.status}
          />
        </div>

        <dl className="mt-5 grid gap-4 type-caption sm:grid-cols-2 xl:grid-cols-3">
          <InvitationMetric
            label={t("admin.invitations.field.targetRole", "ko")}
            value={invitation.targetRoleKey}
          />
          <InvitationMetric
            label={t("admin.invitations.field.invitedEmail", "ko")}
            value={invitation.invitedEmail ?? t("admin.invitations.notAvailable", "ko")}
          />
          <InvitationMetric
            label={t("admin.invitations.field.usage", "ko")}
            value={`${invitation.usedCount} / ${invitation.maxUses}`}
          />
          <InvitationMetric
            label={t("admin.invitations.field.expiresAt", "ko")}
            value={formatDate(invitation.expiresAt)}
          />
          <InvitationMetric
            label={t("admin.invitations.field.createdAt", "ko")}
            value={formatDate(invitation.createdAt)}
          />
          <InvitationMetric
            label={t("admin.invitations.field.invitationId", "ko")}
            value={invitation.id}
          />
        </dl>
      </div>

      <aside className="grid content-start gap-3 rounded-2xl bg-canvas-parchment p-4">
        <p className="type-fine-print text-calm-ink-muted-48">
          {t("admin.invitations.actions", "ko")}
        </p>
        <RevokeForm invitation={invitation} />
      </aside>
    </article>
  );
}

export function InvitationList({
  invitations,
  queryError,
  result,
}: InvitationListProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-calm-hairline bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-calm-hairline px-6 py-5">
        <div>
          <h2 className="type-body-strong text-calm-ink">
            {t("admin.invitations.list.title", "ko")}
          </h2>
          <p className="type-caption mt-1 text-calm-ink-muted-48">
            {t("admin.invitations.list.description", "ko")}
          </p>
        </div>
        <Badge dot={false} tone={invitations.length > 0 ? "info" : "neutral"}>
          {invitations.length}
        </Badge>
      </div>

      <div className="px-6 py-5">
        <ResultBanner queryError={queryError} result={result} />
      </div>

      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <InvitationItem invitation={invitation} key={invitation.id} />
        ))
      ) : (
        <p className="type-caption border-t border-calm-hairline px-6 py-8 text-calm-ink-muted-48">
          {queryError
            ? t("admin.invitations.emptyBlocked", "ko")
            : t("admin.invitations.empty", "ko")}
        </p>
      )}
    </section>
  );
}
