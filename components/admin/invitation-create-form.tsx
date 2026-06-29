"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  createAdminInvitationFormAction,
  type AdminInvitationCreateFormState,
} from "@/lib/invitations/actions";
import { INVITATION_TYPES } from "@/lib/invitations/types";
import { Badge } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";

const ROLE_OPTIONS = [
  "supplier",
  "agent",
  "buyer",
  "professor",
  "student",
] as const;

const PARENT_ROLE_OPTIONS = ["", "agent", "professor"] as const;

const initialState: AdminInvitationCreateFormState = {
  created: null,
  error: null,
  ok: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="pill-primary min-h-11 w-full" disabled={pending} type="submit">
      {pending
        ? t("admin.invitations.create.pending", "ko")
        : t("admin.invitations.create.submit", "ko")}
    </button>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label className="type-fine-print text-calm-ink-muted-48" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function TextInput({
  id,
  maxLength = 120,
  name,
  placeholder,
  type = "text",
}: {
  id: string;
  maxLength?: number;
  name: string;
  placeholder?: string;
  type?: "datetime-local" | "email" | "number" | "text" | "url";
}) {
  return (
    <input
      className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
      id={id}
      maxLength={type === "number" ? undefined : maxLength}
      min={type === "number" ? 1 : undefined}
      name={name}
      placeholder={placeholder}
      type={type}
    />
  );
}

function CreateResult({ state }: { state: AdminInvitationCreateFormState }) {
  if (state.error) {
    return (
      <div className="rounded-2xl border border-status-negative/20 bg-status-negative-bg px-5 py-4 text-status-negative">
        <p className="type-caption-strong">
          {t("admin.invitations.create.error", "ko")}
        </p>
        <p className="mt-1 break-words type-caption">{state.error}</p>
      </div>
    );
  }

  if (!state.ok || !state.created) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-status-positive/20 bg-status-positive-bg px-5 py-4 text-status-positive">
      <p className="type-caption-strong">
        {t("admin.invitations.create.success", "ko")}
      </p>
      <p className="mt-2 type-caption text-calm-ink-muted-80">
        {t("admin.invitations.create.tokenOnce", "ko")}
      </p>
      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="type-fine-print text-calm-ink-muted-48">
            {t("admin.invitations.create.invitationId", "ko")}
          </dt>
          <dd className="mt-1 break-all rounded-xl border border-status-positive/20 bg-white px-3 py-2 type-caption-strong text-calm-ink">
            {state.created.invitationId}
          </dd>
        </div>
        <div>
          <dt className="type-fine-print text-calm-ink-muted-48">
            {t("admin.invitations.create.rawToken", "ko")}
          </dt>
          <dd className="mt-1 break-all rounded-xl border border-status-positive/20 bg-white px-3 py-2 font-mono text-[12px] text-calm-ink">
            {state.created.token}
          </dd>
        </div>
        {state.created.invitationUrl ? (
          <div>
            <dt className="type-fine-print text-calm-ink-muted-48">
              {t("admin.invitations.create.invitationUrl", "ko")}
            </dt>
            <dd className="mt-1 break-all rounded-xl border border-status-positive/20 bg-white px-3 py-2 font-mono text-[12px] text-calm-ink">
              {state.created.invitationUrl}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function InvitationCreateForm() {
  const [state, formAction] = useActionState(
    createAdminInvitationFormAction,
    initialState,
  );

  return (
    <section className="rounded-[18px] border border-calm-hairline bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.invitations.create.eyebrow", "ko")}
          </Badge>
          <h2 className="type-body-strong mt-3 text-calm-ink">
            {t("admin.invitations.create.title", "ko")}
          </h2>
          <p className="type-caption mt-2 max-w-2xl text-calm-ink-muted-80">
            {t("admin.invitations.create.description", "ko")}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <CreateResult state={state} />
      </div>

      <form action={formAction} className="mt-6 grid gap-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor="invitationType">
              {t("admin.invitations.field.invitationType", "ko")}
            </FieldLabel>
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
              id="invitationType"
              name="invitationType"
              required
            >
              {INVITATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="targetRoleKey">
              {t("admin.invitations.field.targetRole", "ko")}
            </FieldLabel>
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
              id="targetRoleKey"
              name="targetRoleKey"
              required
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="invitedEmail">
              {t("admin.invitations.field.invitedEmail", "ko")}
            </FieldLabel>
            <TextInput
              id="invitedEmail"
              maxLength={320}
              name="invitedEmail"
              placeholder={t("admin.invitations.placeholder.invitedEmail", "ko")}
              type="email"
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="maxUses">
              {t("admin.invitations.field.maxUses", "ko")}
            </FieldLabel>
            <TextInput id="maxUses" name="maxUses" placeholder="1" type="number" />
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="expiresAt">
              {t("admin.invitations.field.expiresAt", "ko")}
            </FieldLabel>
            <TextInput id="expiresAt" name="expiresAt" type="datetime-local" />
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="baseUrl">
              {t("admin.invitations.field.baseUrl", "ko")}
            </FieldLabel>
            <TextInput
              id="baseUrl"
              maxLength={500}
              name="baseUrl"
              placeholder="https://example.com/signup/invitation"
              type="url"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4">
          <p className="type-caption-strong text-calm-ink">
            {t("admin.invitations.create.parentTitle", "ko")}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="parentRoleKey">
                {t("admin.invitations.field.parentRole", "ko")}
              </FieldLabel>
              <select
                className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                id="parentRoleKey"
                name="parentRoleKey"
              >
                {PARENT_ROLE_OPTIONS.map((role) => (
                  <option key={role || "none"} value={role}>
                    {role || t("admin.invitations.option.none", "ko")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="parentAccountId">
                {t("admin.invitations.field.parentAccountId", "ko")}
              </FieldLabel>
              <TextInput id="parentAccountId" name="parentAccountId" />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="agentId">
                {t("admin.invitations.field.agentId", "ko")}
              </FieldLabel>
              <TextInput id="agentId" name="agentId" />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="professorId">
                {t("admin.invitations.field.professorId", "ko")}
              </FieldLabel>
              <TextInput id="professorId" name="professorId" />
            </div>
            <div className="grid gap-2 lg:col-span-2">
              <FieldLabel htmlFor="companyId">
                {t("admin.invitations.field.companyId", "ko")}
              </FieldLabel>
              <TextInput id="companyId" name="companyId" />
            </div>
          </div>
        </div>

        <SubmitButton />
      </form>
    </section>
  );
}
