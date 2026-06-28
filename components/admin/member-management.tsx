"use client";

import { useMemo, useState } from "react";
import {
  approveMemberAction,
  createMemberManuallyAction,
  forceWithdrawMemberAction,
  reactivateMemberAction,
  rejectMemberAction,
  sendMemberAdminMessageAction,
  suspendMemberAction,
  updateMemberProfileAction,
  updateMemberRolesAction,
} from "@/lib/actions/admin-members";
import { Badge } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";
import type { AdminMemberItem, AdminMembersData } from "@/lib/queries/admin-members";

type MemberManagementProps = AdminMembersData & {
  result:
    | "approved"
    | "created"
    | "error"
    | "messaged"
    | "reactivated"
    | "rejected"
    | "rolesUpdated"
    | "suspended"
    | "updated"
    | "withdrawn"
    | null;
};

const APPROVAL_OPTIONS = ["all", "pending", "approved", "rejected", "suspended"] as const;
const ACTIVITY_OPTIONS = ["all", "active", "inactive", "blocked"] as const;

const ROLE_BADGE_CLASS: Record<string, string> = {
  agent: "border-sky-200 bg-sky-50 text-sky-700",
  buyer: "border-emerald-200 bg-emerald-50 text-emerald-700",
  professor: "border-violet-200 bg-violet-50 text-violet-700",
  student: "border-amber-200 bg-amber-50 text-amber-700",
  supplier: "border-blue-200 bg-blue-50 text-blue-700",
};

function notifyAction(message: string, tone: "info" | "success" | "warning" | "danger" = "success") {
  window.dispatchEvent(new CustomEvent("b2bb2g:toast", { detail: { message, tone } }));
}

const APPROVAL_BADGE_CLASS: Record<string, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  suspended: "border-orange-200 bg-orange-50 text-orange-700",
};

const ACTIVITY_BADGE_CLASS: Record<string, string> = {
  active: "border-blue-200 bg-blue-50 text-blue-700",
  blocked: "border-red-200 bg-red-50 text-red-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
};

function formatDate(value: string | null): string {
  if (!value) {
    return t("admin.members.notAvailable", "ko");
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSafeValue(value: string | null): string {
  return value?.trim() || t("admin.members.notAvailable", "ko");
}

function csvEscape(value: string | number | null): string {
  const raw = value === null ? "" : String(value);

  return `"${raw.replaceAll('"', '""')}"`;
}

function buildCsv(items: AdminMemberItem[]): string {
  const headers = [
    "No",
    "Role",
    "Email",
    "Display Name",
    "Approval",
    "Activity",
    "Country",
    "Referrer",
    "Joined At",
    "Signup IP",
    "Unread",
  ];
  const rows = items.map((member, index) => [
    index + 1,
    member.memberTypeName,
    member.email,
    member.displayName ?? "",
    member.approvalStatus,
    member.activityStatus,
    member.countryName ?? "",
    member.referralSourceName ?? member.referralSourceEmail ?? "",
    formatDate(member.createdAt),
    member.signupIpAddress ?? "",
    member.unreadNotificationsCount,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => csvEscape(value)).join(","))
    .join("\n");
}

function matchesMember(input: {
  activityStatus: MemberManagementProps["filters"]["activityStatus"];
  approvalStatus: MemberManagementProps["filters"]["approvalStatus"];
  member: AdminMemberItem;
  memberType: MemberManagementProps["filters"]["memberType"];
  query: string;
}): boolean {
  const normalizedQuery = input.query.trim().toLowerCase();
  const memberTypeMatches =
    input.memberType === "all" || input.member.memberTypeCode === input.memberType;
  const approvalMatches =
    input.approvalStatus === "all" || input.member.approvalStatus === input.approvalStatus;
  const activityMatches =
    input.activityStatus === "all" || input.member.activityStatus === input.activityStatus;

  if (!memberTypeMatches || !approvalMatches || !activityMatches) {
    return false;
  }

  if (!normalizedQuery) {
    return true;
  }

  return [
    input.member.displayName ?? "",
    input.member.email,
    input.member.memberTypeName,
    input.member.countryName ?? "",
    input.member.careerRankName ?? "",
    input.member.phone ?? "",
    input.member.primaryLanguage ?? "",
    input.member.referralSourceEmail ?? "",
    input.member.referralSourceName ?? "",
    input.member.approvalStatus,
    input.member.activityStatus,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function HiddenProfileId({ profileId }: { profileId: string }) {
  return <input name="profileId" type="hidden" value={profileId} />;
}

function RoleBadge({ member }: { member: AdminMemberItem }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[12px] font-semibold leading-none ${
        ROLE_BADGE_CLASS[member.memberTypeCode] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {member.memberTypeName}
    </span>
  );
}

function StatusPill({
  kind,
  label,
  value,
}: {
  kind: "activity" | "approval";
  label: string;
  value: string;
}) {
  const className =
    kind === "approval"
      ? APPROVAL_BADGE_CLASS[value] ?? "border-slate-200 bg-slate-50 text-slate-700"
      : ACTIVITY_BADGE_CLASS[value] ?? "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[12px] font-semibold leading-none ${className}`}
    >
      {label}
    </span>
  );
}

function RoleSummary({ member }: { member: AdminMemberItem }) {
  if (member.roles.length === 0) {
    return (
      <span className="type-fine-print text-calm-ink-muted-48">
        {t("admin.members.noExtraRoles", "ko")}
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {member.roles.map((role) => (
        <span
          className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[12px] font-semibold ${
            ROLE_BADGE_CLASS[role.code] ?? "border-action-blue/20 bg-action-blue/6 text-action-blue"
          }`}
          key={role.id}
        >
          {role.name}
        </span>
      ))}
    </span>
  );
}

function ResultBanner({ result }: Pick<MemberManagementProps, "result">) {
  if (!result) {
    return null;
  }

  const isError = result === "error";

  return (
    <div
      className={`rounded-[18px] border px-5 py-4 ${
        isError
          ? "border-status-negative/20 bg-status-negative-bg text-status-negative"
          : "border-action-blue/15 bg-action-blue/5 text-action-blue"
      }`}
    >
      <p className="type-caption-strong">{t(`admin.members.result.${result}`, "ko")}</p>
    </div>
  );
}

function SummaryCard({ labelKey, value }: { labelKey: string; value: number }) {
  return (
    <article className="rounded-[18px] border border-calm-hairline bg-white px-5 py-4">
      <p className="type-caption text-calm-ink-muted-48">{t(labelKey, "ko")}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-action-blue">
        {value}
      </p>
    </article>
  );
}

function ApprovalActions({ member }: { member: AdminMemberItem }) {
  if (member.approvalStatus === "approved") {
    return (
      <p className="rounded-2xl border border-status-positive/20 bg-status-positive-bg px-4 py-3 type-caption text-status-positive">
        {t("admin.members.approvedNoAction", "ko")}
      </p>
    );
  }

  if (member.approvalStatus !== "pending") {
    return (
      <p className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3 type-caption text-calm-ink-muted-48">
        {t("admin.members.alreadyRejected", "ko")}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <form
        action={approveMemberAction}
        className="grid gap-2"
        data-action-confirm="true"
        data-confirm-message={t("feedback.member.approve.confirm", "ko")}
        data-pending-message={t("feedback.pending.approve", "ko")}
        data-success-message={t("feedback.success.approve", "ko")}
      >
        <HiddenProfileId profileId={member.id} />
        <input
          className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
          maxLength={1000}
          name="reason"
          placeholder={t("admin.members.reasonPlaceholder", "ko")}
        />
        <button className="pill-primary w-full" type="submit">
          {t("admin.members.approve", "ko")}
        </button>
      </form>

      <form
        action={rejectMemberAction}
        className="grid gap-2"
        data-action-confirm="true"
        data-confirm-message={t("feedback.member.reject.confirm", "ko")}
        data-confirm-tone="danger"
        data-pending-message={t("feedback.pending.reject", "ko")}
        data-success-message={t("feedback.success.reject", "ko")}
      >
        <HiddenProfileId profileId={member.id} />
        <input
          className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
          maxLength={1000}
          name="reason"
          placeholder={t("admin.members.reasonPlaceholder", "ko")}
        />
        <button
          className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
          type="submit"
        >
          {t("admin.members.reject", "ko")}
        </button>
      </form>
    </div>
  );
}

function ActivityActions({ member }: { member: AdminMemberItem }) {
  if (member.approvalStatus !== "approved") {
    return (
      <p className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3 type-caption text-calm-ink-muted-48">
        {t("admin.members.activityNeedsApproval", "ko")}
      </p>
    );
  }

  if (member.activityStatus !== "active") {
    return (
      <form
        action={reactivateMemberAction}
        className="grid gap-2"
        data-action-confirm="true"
        data-confirm-message={t("feedback.member.reactivate.confirm", "ko")}
        data-pending-message={t("feedback.pending.save", "ko")}
        data-success-message={t("feedback.success.save", "ko")}
      >
        <HiddenProfileId profileId={member.id} />
        <input
          className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
          maxLength={1000}
          name="reason"
          placeholder={t("admin.members.reasonPlaceholder", "ko")}
        />
        <button className="pill-primary w-full" type="submit">
          {t("admin.members.reactivate", "ko")}
        </button>
      </form>
    );
  }

  return (
    <form
      action={suspendMemberAction}
      className="grid gap-2"
      data-action-confirm="true"
      data-confirm-message={t("feedback.member.suspend.confirm", "ko")}
      data-confirm-tone="warning"
      data-pending-message={t("feedback.pending.suspend", "ko")}
      data-success-message={t("feedback.success.suspend", "ko")}
    >
      <HiddenProfileId profileId={member.id} />
      <input
        className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
        maxLength={1000}
        name="reason"
        placeholder={t("admin.members.suspendReasonPlaceholder", "ko")}
      />
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
        type="submit"
      >
        {t("admin.members.suspend", "ko")}
      </button>
    </form>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="inline-flex min-h-8 items-center justify-center rounded-full border border-calm-hairline bg-white px-3 text-[12px] font-semibold text-calm-ink-muted-80 transition hover:border-action-blue/25 hover:text-action-blue"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          notifyAction(t("feedback.toast.copy", "ko"), "success");
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      type="button"
    >
      {copied ? t("admin.members.copied", "ko") : label}
    </button>
  );
}

function DetailField({
  copyValue,
  label,
  value,
}: {
  copyValue?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-calm-hairline bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="type-fine-print text-calm-ink-muted-48">{label}</p>
        {copyValue ? <CopyButton label={t("admin.members.copy", "ko")} value={copyValue} /> : null}
      </div>
      <p className="mt-2 break-words type-caption-strong text-calm-ink">{value}</p>
    </div>
  );
}

function MemberDrawer({
  countryOptions,
  member,
  memberTypeOptions,
  onClose,
  roleOptions,
}: {
  countryOptions: MemberManagementProps["countryOptions"];
  member: AdminMemberItem | null;
  memberTypeOptions: MemberManagementProps["memberTypeOptions"];
  onClose: () => void;
  roleOptions: MemberManagementProps["roleOptions"];
}) {
  if (!member) {
    return null;
  }

  const messageTitle = t("admin.members.messageDefaultTitle", "ko");

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label={t("admin.members.closeDetail", "ko")}
        className="absolute inset-0 cursor-default bg-slate-950/20 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="admin-member-drawer absolute right-0 top-0 flex h-full w-full max-w-[680px] flex-col overflow-hidden bg-white shadow-[0_28px_90px_rgb(15_23_42/0.18)]">
        <div className="border-b border-calm-hairline px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge member={member} />
                <StatusPill
                  kind="approval"
                  label={t(`admin.members.approval.${member.approvalStatus}`, "ko")}
                  value={member.approvalStatus}
                />
                <StatusPill
                  kind="activity"
                  label={t(`admin.members.activity.${member.activityStatus}`, "ko")}
                  value={member.activityStatus}
                />
              </div>
              <h2 className="mt-4 truncate text-[24px] font-semibold tracking-[-0.02em] text-calm-ink">
                {member.displayName ?? member.email}
              </h2>
              <p className="mt-1 type-caption text-calm-ink-muted-48">{member.email}</p>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-calm-hairline text-[20px] leading-none text-calm-ink-muted-80 transition hover:border-action-blue/25 hover:text-action-blue"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f7faff] px-6 py-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <DetailField label={t("admin.members.profileId", "ko")} value={member.id} copyValue={member.id} />
            <DetailField label={t("admin.members.email", "ko")} value={member.email} copyValue={member.email} />
            <DetailField label={t("admin.members.phone", "ko")} value={getSafeValue(member.phone)} copyValue={member.phone ?? undefined} />
            <DetailField label={t("admin.members.country", "ko")} value={getSafeValue(member.countryName)} />
            <DetailField label={t("admin.members.primaryLanguage", "ko")} value={getSafeValue(member.primaryLanguage)} />
            <DetailField label={t("admin.members.careerRank", "ko")} value={getSafeValue(member.careerRankName)} />
            <DetailField label={t("admin.members.joinedAt", "ko")} value={formatDate(member.createdAt)} />
            <DetailField label={t("admin.members.updatedAt", "ko")} value={formatDate(member.updatedAt)} />
            <DetailField label={t("admin.members.signupIp", "ko")} value={getSafeValue(member.signupIpAddress)} />
            <DetailField label={t("admin.members.lastActivityAt", "ko")} value={formatDate(member.lastActivityAt)} />
          </section>

          <section className="mt-5 rounded-[22px] border border-calm-hairline bg-white p-5">
            <div>
              <p className="type-caption-strong text-calm-ink">
                {t("admin.members.editTitle", "ko")}
              </p>
              <p className="mt-1 type-caption text-calm-ink-muted-48">
                {t("admin.members.editDescription", "ko")}
              </p>
            </div>
            <form
              action={updateMemberProfileAction}
              className="mt-4 grid gap-3"
              data-action-confirm="true"
              data-confirm-message={t("feedback.member.profile.confirm", "ko")}
              data-pending-message={t("feedback.pending.save", "ko")}
              data-success-message={t("feedback.success.save", "ko")}
            >
              <HiddenProfileId profileId={member.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.displayName", "ko")}</span>
                  <input
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.displayName ?? ""}
                    maxLength={100}
                    name="displayName"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.phone", "ko")}</span>
                  <input
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.phone ?? ""}
                    maxLength={40}
                    name="phone"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.memberTypeLabel", "ko")}</span>
                  <select
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.memberTypeId}
                    name="memberTypeId"
                  >
                    {memberTypeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.country", "ko")}</span>
                  <select
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.countryId ?? ""}
                    name="countryId"
                  >
                    <option value="">{t("admin.members.notAvailable", "ko")}</option>
                    {countryOptions.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.approvalActions", "ko")}</span>
                  <select
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.approvalStatus}
                    name="approvalStatus"
                  >
                    {APPROVAL_OPTIONS.filter((status) => status !== "all").map((status) => (
                      <option key={status} value={status}>
                        {t(`admin.members.approval.${status}`, "ko")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.activityActions", "ko")}</span>
                  <select
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.activityStatus}
                    name="activityStatus"
                  >
                    {ACTIVITY_OPTIONS.filter((status) => status !== "all").map((status) => (
                      <option key={status} value={status}>
                        {t(`admin.members.activity.${status}`, "ko")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="type-fine-print text-calm-ink-muted-48">{t("admin.members.primaryLanguage", "ko")}</span>
                  <input
                    className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                    defaultValue={member.primaryLanguage ?? ""}
                    maxLength={20}
                    name="primaryLanguage"
                  />
                </label>
                <label className="flex min-h-10 items-center gap-2 self-end rounded-xl border border-calm-hairline px-3 type-caption text-calm-ink">
                  <input defaultChecked={member.isActive} name="isActive" type="checkbox" />
                  {t("admin.members.isActive", "ko")}
                </label>
              </div>
              <input
                className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                maxLength={1000}
                name="reason"
                placeholder={t("admin.members.reasonPlaceholder", "ko")}
              />
              <button className="pill-primary w-full" type="submit">
                {t("admin.members.saveChanges", "ko")}
              </button>
            </form>
          </section>

          <section className="mt-5 rounded-[22px] border border-calm-hairline bg-white p-5">
            <p className="type-caption-strong text-calm-ink">
              {t("admin.members.rolesTitle", "ko")}
            </p>
            <p className="mt-1 type-fine-print text-calm-ink-muted-48">
              {t("admin.members.rolesDescription", "ko")}
            </p>
            <div className="mt-3">
              <RoleSummary member={member} />
            </div>
            <form
              action={updateMemberRolesAction}
              className="mt-4 grid gap-3"
              data-action-confirm="true"
              data-confirm-message={t("feedback.member.roles.confirm", "ko")}
              data-pending-message={t("feedback.pending.save", "ko")}
              data-success-message={t("feedback.success.save", "ko")}
            >
              <HiddenProfileId profileId={member.id} />
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.length > 0 ? (
                  roleOptions.map((role) => (
                    <label
                      className={`flex min-h-10 items-center gap-2 rounded-xl border bg-white px-3 type-caption ${
                        ROLE_BADGE_CLASS[role.code] ?? "border-calm-hairline text-calm-ink"
                      }`}
                      key={role.id}
                    >
                      <input
                        defaultChecked={member.roles.some((item) => item.id === role.id)}
                        name="roleIds"
                        type="checkbox"
                        value={role.id}
                      />
                      {role.name}
                    </label>
                  ))
                ) : (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 type-fine-print text-amber-700 sm:col-span-2">
                    {t("admin.members.rolesEmpty", "ko")}
                  </p>
                )}
              </div>
              <button
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-action-blue/25 type-caption-strong text-action-blue transition hover:bg-action-blue/5"
                type="submit"
              >
                {t("admin.members.saveRoles", "ko")}
              </button>
            </form>
          </section>

          <section className="mt-5 rounded-[22px] border border-calm-hairline bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="type-caption-strong text-calm-ink">{t("admin.members.referralTitle", "ko")}</p>
                <p className="mt-1 type-caption text-calm-ink-muted-48">
                  {t("admin.members.referralDescription", "ko")}
                </p>
              </div>
              <Badge dot={false} tone={member.referralStatus ? "info" : "neutral"}>
                {member.referralStatus ?? t("admin.members.noReferral", "ko")}
              </Badge>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailField label={t("admin.members.referrer", "ko")} value={getSafeValue(member.referralSourceName)} />
              <DetailField label={t("admin.members.referrerEmail", "ko")} value={getSafeValue(member.referralSourceEmail)} copyValue={member.referralSourceEmail ?? undefined} />
              <DetailField label={t("admin.members.rewardStatus", "ko")} value={getSafeValue(member.referralRewardStatus)} />
              <DetailField label={t("admin.members.isActive", "ko")} value={member.isActive ? t("admin.members.yes", "ko") : t("admin.members.no", "ko")} />
            </dl>
          </section>

          <section className="mt-5 rounded-[22px] border border-calm-hairline bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="type-caption-strong text-calm-ink">{t("admin.members.messageTitle", "ko")}</p>
                <p className="mt-1 type-caption text-calm-ink-muted-48">
                  {t("admin.members.messageDescription", "ko")}
                </p>
              </div>
              <Badge dot={false} tone={member.unreadNotificationsCount > 0 ? "info" : "neutral"}>
                {member.unreadNotificationsCount}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailField label={t("admin.members.totalMessages", "ko")} value={String(member.totalNotificationsCount)} />
              <DetailField label={t("admin.members.lastReadAt", "ko")} value={formatDate(member.lastNotificationReadAt)} />
            </div>
            <form
              action={sendMemberAdminMessageAction}
              className="mt-4 grid gap-3"
              data-action-confirm="true"
              data-confirm-message={t("feedback.member.message.confirm", "ko")}
              data-pending-message={t("feedback.pending.send", "ko")}
              data-success-message={t("feedback.success.send", "ko")}
            >
              <HiddenProfileId profileId={member.id} />
              <input
                className="min-h-10 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                maxLength={120}
                name="title"
                placeholder={t("admin.members.messageTitlePlaceholder", "ko")}
                type="text"
                defaultValue={messageTitle}
              />
              <textarea
                className="min-h-28 rounded-xl border border-calm-hairline bg-white px-3 py-3 type-caption text-calm-ink outline-none focus:border-action-blue"
                maxLength={1000}
                name="body"
                placeholder={t("admin.members.messageBodyPlaceholder", "ko")}
                required
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="pill-primary" type="submit">
                  {t("admin.members.sendMessage", "ko")}
                </button>
                <a
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-calm-hairline bg-white px-4 type-caption-strong text-calm-ink transition hover:border-action-blue/25 hover:text-action-blue"
                  href={`mailto:${member.email}`}
                >
                  {t("admin.members.openEmail", "ko")}
                </a>
              </div>
            </form>
          </section>

          <section className="mt-5 grid gap-4 rounded-[22px] border border-calm-hairline bg-white p-5 md:grid-cols-2">
            <div>
              <p className="mb-3 type-caption-strong text-calm-ink">
                {t("admin.members.approvalActions", "ko")}
              </p>
              <ApprovalActions member={member} />
            </div>
            <div>
              <p className="mb-3 type-caption-strong text-calm-ink">
                {t("admin.members.activityActions", "ko")}
              </p>
              <ActivityActions member={member} />
            </div>
          </section>

          <section className="mt-5 rounded-[22px] border border-status-negative/20 bg-white p-5">
            <p className="type-caption-strong text-status-negative">
              {t("admin.members.dangerTitle", "ko")}
            </p>
            <p className="mt-1 type-caption text-calm-ink-muted-48">
              {t("admin.members.dangerDescription", "ko")}
            </p>
            <form
              action={forceWithdrawMemberAction}
              className="mt-4 grid gap-3"
              data-action-confirm="true"
              data-confirm-message={t("feedback.member.withdraw.confirm", "ko")}
              data-confirm-tone="danger"
              data-pending-message={t("feedback.pending.delete", "ko")}
              data-success-message={t("feedback.success.delete", "ko")}
            >
              <HiddenProfileId profileId={member.id} />
              <input
                className="min-h-10 rounded-xl border border-status-negative/20 bg-white px-3 type-caption text-calm-ink outline-none focus:border-status-negative"
                maxLength={1000}
                name="reason"
                placeholder={t("admin.members.withdrawReasonPlaceholder", "ko")}
                required
              />
              <button
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-status-negative/30 type-caption-strong text-status-negative transition hover:bg-status-negative-bg"
                type="submit"
              >
                {t("admin.members.forceWithdraw", "ko")}
              </button>
            </form>
          </section>
        </div>
      </aside>
    </div>
  );
}

export function MemberManagement({
  countryOptions,
  filters,
  items,
  memberTypeOptions,
  result,
  roleOptions,
  summary,
}: MemberManagementProps) {
  const [query, setQuery] = useState(filters.query);
  const [memberType, setMemberType] = useState(filters.memberType);
  const [approvalStatus, setApprovalStatus] = useState(filters.approvalStatus);
  const [activityStatus, setActivityStatus] = useState(filters.activityStatus);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filterMemberTypeOptions = useMemo(() => {
    const seen = new Map<string, string>();

    for (const item of items) {
      if (!seen.has(item.memberTypeCode)) {
        seen.set(item.memberTypeCode, item.memberTypeName);
      }
    }

    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const visibleItems = useMemo(
    () =>
      items.filter((member) =>
        matchesMember({ activityStatus, approvalStatus, member, memberType, query }),
      ),
    [activityStatus, approvalStatus, items, memberType, query],
  );

  const selectedMember =
    visibleItems.find((member) => member.id === selectedMemberId) ?? null;
  const hasActiveFilters =
    query.trim() !== "" ||
    memberType !== "all" ||
    approvalStatus !== "all" ||
    activityStatus !== "all";

  function resetFilters() {
    setQuery("");
    setMemberType("all");
    setApprovalStatus("all");
    setActivityStatus("all");
  }

  function downloadCsv() {
    const csv = buildCsv(visibleItems);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `b2bb2g-members-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notifyAction(t("feedback.toast.download", "ko"), "success");
  }

  return (
    <main className="admin-page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.members.eyebrow", "ko")}
          </Badge>
          <h1 className="type-display-md mt-3 text-calm-ink">
            {t("admin.members.title", "ko")}
          </h1>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t("admin.members.description", "ko")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-action-blue/30 bg-white px-5 type-caption-strong text-action-blue transition hover:bg-action-blue/5 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={visibleItems.length === 0}
            onClick={downloadCsv}
            type="button"
          >
            {t("admin.members.download", "ko")}
          </button>
          <button
            className="pill-primary min-h-10 px-5"
            onClick={() => setIsCreateOpen((value) => !value)}
            type="button"
          >
            {t("admin.members.createMember", "ko")}
          </button>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard labelKey="admin.members.metric.total" value={summary.total} />
        <SummaryCard labelKey="admin.members.metric.pending" value={summary.pending} />
        <SummaryCard labelKey="admin.members.metric.active" value={summary.active} />
        <SummaryCard labelKey="admin.members.metric.blocked" value={summary.blocked} />
        <SummaryCard labelKey="admin.members.metric.rejected" value={summary.rejected} />
        <SummaryCard labelKey="admin.members.metric.suspended" value={summary.suspended} />
      </section>

      <div className="mt-6">
        <ResultBanner result={result} />
      </div>

      {isCreateOpen ? (
        <section className="mt-6 rounded-[22px] border border-action-blue/20 bg-white p-5 shadow-[0_18px_50px_rgb(30_64_175/0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="type-body-strong text-calm-ink">
                {t("admin.members.createTitle", "ko")}
              </h2>
              <p className="mt-1 type-caption text-calm-ink-muted-48">
                {t("admin.members.createDescription", "ko")}
              </p>
            </div>
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-calm-hairline px-4 type-caption-strong text-calm-ink-muted-80 transition hover:border-action-blue/25 hover:text-action-blue"
              onClick={() => setIsCreateOpen(false)}
              type="button"
            >
              {t("admin.members.closeCreate", "ko")}
            </button>
          </div>
          <form
            action={createMemberManuallyAction}
            className="mt-5 grid gap-3 lg:grid-cols-3"
            data-action-confirm="true"
            data-confirm-message={t("feedback.member.create.confirm", "ko")}
            data-pending-message={t("feedback.pending.create", "ko")}
            data-success-message={t("feedback.success.create", "ko")}
          >
            <input
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              maxLength={254}
              name="email"
              placeholder={t("admin.members.email", "ko")}
              required
              type="email"
            />
            <input
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              maxLength={100}
              name="displayName"
              placeholder={t("admin.members.displayName", "ko")}
            />
            <input
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              minLength={8}
              name="password"
              placeholder={t("admin.members.passwordPlaceholder", "ko")}
              type="password"
            />
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              name="memberTypeId"
              required
            >
              {memberTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              name="approvalStatus"
              defaultValue="pending"
            >
              {APPROVAL_OPTIONS.filter((status) => status !== "all").map((status) => (
                <option key={status} value={status}>
                  {t(`admin.members.approval.${status}`, "ko")}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              name="countryId"
            >
              <option value="">{t("admin.members.country", "ko")}</option>
              {countryOptions.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            <input
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              maxLength={40}
              name="phone"
              placeholder={t("admin.members.phone", "ko")}
            />
            <input
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
              defaultValue="en"
              maxLength={20}
              name="primaryLanguage"
              placeholder={t("admin.members.primaryLanguage", "ko")}
            />
            <div className="rounded-xl border border-calm-hairline bg-[#f7faff] p-3 lg:col-span-3">
              <p className="type-fine-print text-calm-ink-muted-48">
                {t("admin.members.rolesTitle", "ko")}
              </p>
              <p className="mt-1 type-fine-print text-calm-ink-muted-48">
                {t("admin.members.rolesDescription", "ko")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roleOptions.length > 0 ? (
                  roleOptions.map((role) => (
                    <label
                      className={`inline-flex min-h-8 items-center gap-2 rounded-full border bg-white px-3 type-fine-print ${
                        ROLE_BADGE_CLASS[role.code] ?? "border-calm-hairline text-calm-ink"
                      }`}
                      key={role.id}
                    >
                      <input name="roleIds" type="checkbox" value={role.id} />
                      {role.name}
                    </label>
                  ))
                ) : (
                  <span className="type-fine-print text-amber-700">
                    {t("admin.members.rolesEmpty", "ko")}
                  </span>
                )}
              </div>
            </div>
            <button className="pill-primary min-h-11 lg:col-span-3" type="submit">
              {t("admin.members.createSubmit", "ko")}
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-8 rounded-[22px] border border-calm-hairline bg-white p-5">
        <form
          className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto_auto]"
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
            placeholder={t("admin.members.searchPlaceholder", "ko")}
            type="search"
            value={query}
          />
          <select
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="memberType"
            onChange={(event) => {
              setMemberType(
                event.target.value as MemberManagementProps["filters"]["memberType"],
              );
            }}
            value={memberType}
          >
            <option value="all">{t("admin.members.memberType.all", "ko")}</option>
            {filterMemberTypeOptions.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="approval"
            onChange={(event) => {
              setApprovalStatus(
                event.target.value as MemberManagementProps["filters"]["approvalStatus"],
              );
            }}
            value={approvalStatus}
          >
            {APPROVAL_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`admin.members.approval.${status}`, "ko")}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-xl border border-calm-hairline bg-white px-4 type-caption text-calm-ink outline-none focus:border-action-blue"
            name="activity"
            onChange={(event) => {
              setActivityStatus(
                event.target.value as MemberManagementProps["filters"]["activityStatus"],
              );
            }}
            value={activityStatus}
          >
            {ACTIVITY_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`admin.members.activity.${status}`, "ko")}
              </option>
            ))}
          </select>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-calm-hairline px-6 type-caption-strong text-calm-ink transition hover:border-action-blue/30 hover:text-action-blue disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            type="button"
          >
            {t("admin.members.reset", "ko")}
          </button>
          <p className="flex min-h-11 items-center justify-end type-caption text-calm-ink-muted-48 lg:text-right">
            {t("admin.members.liveCount", "ko")
              .replace("{visible}", String(visibleItems.length))
              .replace("{total}", String(items.length))}
          </p>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-[22px] border border-calm-hairline bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-calm-hairline px-5 py-4">
          <div>
            <h2 className="type-body-strong text-calm-ink">
              {t("admin.members.listTitle", "ko")}
            </h2>
            <p className="mt-1 type-caption text-calm-ink-muted-48">
              {t("admin.members.liveHint", "ko")}
            </p>
          </div>
          <Badge dot={false} tone={visibleItems.length > 0 ? "info" : "neutral"}>
            {visibleItems.length}
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f7faff] text-left type-fine-print text-calm-ink-muted-48">
                <th className="w-16 px-5 py-4">{t("admin.members.table.no", "ko")}</th>
                <th className="px-5 py-4">{t("admin.members.table.role", "ko")}</th>
                <th className="px-5 py-4">{t("admin.members.table.email", "ko")}</th>
                <th className="px-5 py-4">{t("admin.members.table.active", "ko")}</th>
                <th className="px-5 py-4">{t("admin.members.table.referrer", "ko")}</th>
                <th className="px-5 py-4">{t("admin.members.table.joinedAt", "ko")}</th>
                <th className="px-5 py-4 text-right">{t("admin.members.table.detail", "ko")}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length > 0 ? (
                visibleItems.map((member, index) => (
                  <tr
                    className="cursor-pointer border-t border-calm-hairline transition hover:bg-action-blue/5"
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedMemberId(member.id);
                      }
                    }}
                  >
                    <td className="border-t border-calm-hairline px-5 py-4 type-caption text-calm-ink-muted-48">
                      {index + 1}
                    </td>
                    <td className="border-t border-calm-hairline px-5 py-4">
                        <RoleBadge member={member} />
                        <div className="mt-2">
                          <RoleSummary member={member} />
                        </div>
                      </td>
                    <td className="border-t border-calm-hairline px-5 py-4">
                      <p className="type-caption-strong text-calm-ink">
                        {member.displayName ?? member.email}
                      </p>
                      <p className="mt-1 type-caption text-calm-ink-muted-48">
                        {member.email}
                      </p>
                    </td>
                    <td className="border-t border-calm-hairline px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <StatusPill
                          kind="approval"
                          label={t(`admin.members.approval.${member.approvalStatus}`, "ko")}
                          value={member.approvalStatus}
                        />
                        <StatusPill
                          kind="activity"
                          label={t(`admin.members.activity.${member.activityStatus}`, "ko")}
                          value={member.activityStatus}
                        />
                      </div>
                    </td>
                    <td className="border-t border-calm-hairline px-5 py-4 type-caption text-calm-ink-muted-80">
                      {member.referralSourceName ?? member.referralSourceEmail ?? t("admin.members.noReferral", "ko")}
                    </td>
                    <td className="border-t border-calm-hairline px-5 py-4 type-caption text-calm-ink-muted-80">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="border-t border-calm-hairline px-5 py-4 text-right">
                      <button
                        className="inline-flex min-h-9 items-center justify-center rounded-full border border-action-blue/25 bg-white px-4 type-caption-strong text-action-blue transition hover:bg-action-blue/5"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMemberId(member.id);
                        }}
                        type="button"
                      >
                        {t("admin.members.viewDetail", "ko")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-10 type-caption text-calm-ink-muted-48" colSpan={7}>
                    {t("admin.members.empty", "ko")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <MemberDrawer
        countryOptions={countryOptions}
        member={selectedMember}
        memberTypeOptions={memberTypeOptions}
        onClose={() => {
          setSelectedMemberId(null);
        }}
        roleOptions={roleOptions}
      />
    </main>
  );
}
