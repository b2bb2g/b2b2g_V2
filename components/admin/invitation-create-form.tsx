"use client";

import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  createAdminInvitationFormAction,
  type AdminInvitationCreateFormState,
} from "@/lib/invitations/actions";
import type {
  InvitationAgentParentOption,
  InvitationParentSelectorOptions,
  InvitationProfessorParentOption,
  InvitationType,
} from "@/lib/invitations/types";
import { Badge } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";

const ADMIN_INVITATION_TYPES = [
  "supplier_admin_invite",
  "agent_admin_invite",
  "buyer_agent_invite",
  "professor_admin_invite",
  "student_professor_invite",
] as const satisfies readonly InvitationType[];

const ROLE_OPTIONS = [
  "supplier",
  "agent",
  "buyer",
  "professor",
  "student",
] as const;

const PARENT_ROLE_OPTIONS = ["", "agent", "professor"] as const;

const GUIDE_REQUIRED_FIELDS: Record<(typeof ADMIN_INVITATION_TYPES)[number], string[]> = {
  agent_admin_invite: [],
  buyer_agent_invite: [
    "admin.invitations.field.parentRole",
    "admin.invitations.field.parentAccountId",
    "admin.invitations.field.agentId",
  ],
  professor_admin_invite: [],
  student_professor_invite: [
    "admin.invitations.field.parentRole",
    "admin.invitations.field.parentAccountId",
    "admin.invitations.field.professorId",
  ],
  supplier_admin_invite: [],
};

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
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  id: string;
  maxLength?: number;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: "datetime-local" | "email" | "number" | "text" | "url";
  value?: string;
}) {
  return (
    <input
      className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
      id={id}
      maxLength={type === "number" ? undefined : maxLength}
      min={type === "number" ? 1 : undefined}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  );
}

function SelectorCard({
  children,
  isSelected,
  onSelect,
}: {
  children: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-action-blue bg-action-blue/5 shadow-[0_10px_30px_rgb(11_99_206/0.10)]"
          : "border-calm-hairline bg-white hover:border-action-blue/30"
      }`}
      onClick={onSelect}
      type="button"
    >
      {children}
    </button>
  );
}

function getTargetRoleForInvitationType(invitationType: InvitationType): string {
  if (invitationType.startsWith("supplier_")) {
    return "supplier";
  }

  if (invitationType.startsWith("agent_")) {
    return "agent";
  }

  if (invitationType.startsWith("buyer_")) {
    return "buyer";
  }

  if (invitationType.startsWith("professor_")) {
    return "professor";
  }

  return "student";
}

function getRequiredParentRole(invitationType: InvitationType): "" | "agent" | "professor" {
  if (invitationType === "buyer_agent_invite") {
    return "agent";
  }

  if (invitationType === "student_professor_invite") {
    return "professor";
  }

  return "";
}

function InvitationTypeGuide({
  agentId,
  invitationType,
  parentAccountId,
  professorId,
}: {
  agentId: string;
  invitationType: (typeof ADMIN_INVITATION_TYPES)[number];
  parentAccountId: string;
  professorId: string;
}) {
  const requiredParentRole = getRequiredParentRole(invitationType);
  const missingFields: string[] = [];

  if (requiredParentRole && !parentAccountId.trim()) {
    missingFields.push(t("admin.invitations.field.parentAccountId", "ko"));
  }

  if (invitationType === "buyer_agent_invite" && !agentId.trim()) {
    missingFields.push(t("admin.invitations.field.agentId", "ko"));
  }

  if (invitationType === "student_professor_invite" && !professorId.trim()) {
    missingFields.push(t("admin.invitations.field.professorId", "ko"));
  }

  return (
    <aside className="rounded-2xl border border-action-blue/20 bg-action-blue/5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge dot={false} tone={requiredParentRole ? "warning" : "info"}>
          {t("admin.invitations.guide.badge", "ko")}
        </Badge>
        <p className="type-caption-strong text-calm-ink">
          {t(`admin.invitations.guide.${invitationType}.title`, "ko")}
        </p>
      </div>
      <p className="type-caption mt-3 text-calm-ink-muted-80">
        {t(`admin.invitations.guide.${invitationType}.description`, "ko")}
      </p>
      <div className="mt-4 rounded-xl border border-calm-hairline bg-white px-4 py-3">
        <p className="type-fine-print text-calm-ink-muted-48">
          {t("admin.invitations.guide.requiredFields", "ko")}
        </p>
        {GUIDE_REQUIRED_FIELDS[invitationType].length > 0 ? (
          <ul className="mt-2 grid gap-1 type-caption-strong text-calm-ink">
            {GUIDE_REQUIRED_FIELDS[invitationType].map((fieldKey) => (
              <li key={fieldKey}>{t(fieldKey, "ko")}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 type-caption-strong text-calm-ink">
            {t("admin.invitations.guide.noParentRequired", "ko")}
          </p>
        )}
      </div>
      {missingFields.length > 0 ? (
        <p className="mt-3 rounded-xl border border-status-negative/20 bg-status-negative-bg px-3 py-2 type-caption text-status-negative">
          {t("admin.invitations.guide.missingPrefix", "ko")}{" "}
          {missingFields.join(", ")}
        </p>
      ) : null}
      <p className="mt-3 type-fine-print text-calm-ink-muted-48">
        {t("admin.invitations.guide.uuidManual", "ko")}
      </p>
    </aside>
  );
}

function AgentSelector({
  agents,
  selectedAgentId,
  selectorError,
  onSelect,
}: {
  agents: InvitationAgentParentOption[];
  selectedAgentId: string;
  selectorError: string | null;
  onSelect: (agent: InvitationAgentParentOption) => void;
}) {
  return (
    <section className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4">
      <div>
        <p className="type-caption-strong text-calm-ink">
          {t("admin.invitations.selector.agent.title", "ko")}
        </p>
        <p className="type-caption mt-1 text-calm-ink-muted-80">
          {t("admin.invitations.selector.agent.description", "ko")}
        </p>
      </div>

      {selectorError ? (
        <p className="mt-4 rounded-xl border border-status-negative/20 bg-status-negative-bg px-3 py-2 type-caption text-status-negative">
          {selectorError}
        </p>
      ) : null}

      {!selectorError && agents.length === 0 ? (
        <p className="mt-4 rounded-xl border border-calm-hairline bg-white px-3 py-2 type-caption text-calm-ink-muted-48">
          {t("admin.invitations.selector.agent.empty", "ko")}
        </p>
      ) : null}

      {agents.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {agents.map((agent) => (
            <SelectorCard
              isSelected={selectedAgentId === agent.agentId}
              key={agent.agentId}
              onSelect={() => onSelect(agent)}
            >
              <span className="block type-caption-strong text-calm-ink">
                {t("admin.invitations.field.agentId", "ko")}: {agent.agentId}
              </span>
              <span className="mt-1 block break-all type-fine-print text-calm-ink-muted-48">
                {t("admin.invitations.field.parentAccountId", "ko")}:{" "}
                {agent.accountId}
              </span>
              <span className="mt-2 block type-caption text-calm-ink-muted-80">
                {t("admin.invitations.selector.market", "ko")}:{" "}
                {agent.marketSummary ?? t("admin.invitations.notAvailable", "ko")}
              </span>
              <span className="mt-1 block type-fine-print text-calm-ink-muted-48">
                {t("admin.invitations.selector.approvalStatus", "ko")}:{" "}
                {agent.approvalStatus}
              </span>
            </SelectorCard>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProfessorSelector({
  onSelect,
  professors,
  selectedProfessorId,
  selectorError,
}: {
  onSelect: (professor: InvitationProfessorParentOption) => void;
  professors: InvitationProfessorParentOption[];
  selectedProfessorId: string;
  selectorError: string | null;
}) {
  return (
    <section className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4">
      <div>
        <p className="type-caption-strong text-calm-ink">
          {t("admin.invitations.selector.professor.title", "ko")}
        </p>
        <p className="type-caption mt-1 text-calm-ink-muted-80">
          {t("admin.invitations.selector.professor.description", "ko")}
        </p>
      </div>

      {selectorError ? (
        <p className="mt-4 rounded-xl border border-status-negative/20 bg-status-negative-bg px-3 py-2 type-caption text-status-negative">
          {selectorError}
        </p>
      ) : null}

      {!selectorError && professors.length === 0 ? (
        <p className="mt-4 rounded-xl border border-calm-hairline bg-white px-3 py-2 type-caption text-calm-ink-muted-48">
          {t("admin.invitations.selector.professor.empty", "ko")}
        </p>
      ) : null}

      {professors.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {professors.map((professor) => (
            <SelectorCard
              isSelected={selectedProfessorId === professor.professorId}
              key={professor.professorId}
              onSelect={() => onSelect(professor)}
            >
              <span className="block type-caption-strong text-calm-ink">
                {t("admin.invitations.field.professorId", "ko")}:{" "}
                {professor.professorId}
              </span>
              <span className="mt-1 block break-all type-fine-print text-calm-ink-muted-48">
                {t("admin.invitations.field.parentAccountId", "ko")}:{" "}
                {professor.accountId}
              </span>
              <span className="mt-2 block type-caption text-calm-ink-muted-80">
                {t("admin.invitations.selector.university", "ko")}:{" "}
                {professor.universityName ?? t("admin.invitations.notAvailable", "ko")}
              </span>
              <span className="mt-1 block type-fine-print text-calm-ink-muted-48">
                {t("admin.invitations.selector.approvalStatus", "ko")}:{" "}
                {professor.approvalStatus}
              </span>
            </SelectorCard>
          ))}
        </div>
      ) : null}
    </section>
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

export function InvitationCreateForm({
  parentOptions,
  parentSelectorError,
}: {
  parentOptions: InvitationParentSelectorOptions;
  parentSelectorError: string | null;
}) {
  const [state, formAction] = useActionState(
    createAdminInvitationFormAction,
    initialState,
  );
  const [selectedInvitationType, setSelectedInvitationType] = useState<
    (typeof ADMIN_INVITATION_TYPES)[number]
  >("supplier_admin_invite");
  const [targetRoleKey, setTargetRoleKey] = useState("supplier");
  const [parentRoleKey, setParentRoleKey] = useState("");
  const [parentAccountId, setParentAccountId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const requiredParentRole = getRequiredParentRole(selectedInvitationType);

  function handleInvitationTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextInvitationType = event.target.value as (typeof ADMIN_INVITATION_TYPES)[number];
    const nextParentRole = getRequiredParentRole(nextInvitationType);

    setSelectedInvitationType(nextInvitationType);
    setTargetRoleKey(getTargetRoleForInvitationType(nextInvitationType));
    setParentRoleKey(nextParentRole);

    if (!nextParentRole) {
      setParentAccountId("");
    }

    if (nextInvitationType !== "buyer_agent_invite") {
      setAgentId("");
    }

    if (nextInvitationType !== "student_professor_invite") {
      setProfessorId("");
    }
  }

  function handleAgentSelect(agent: InvitationAgentParentOption) {
    setParentRoleKey("agent");
    setParentAccountId(agent.accountId);
    setAgentId(agent.agentId);
    setProfessorId("");
  }

  function handleProfessorSelect(professor: InvitationProfessorParentOption) {
    setParentRoleKey("professor");
    setParentAccountId(professor.accountId);
    setAgentId("");
    setProfessorId(professor.professorId);
  }

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
        <input name="parentRoleKey" type="hidden" value={parentRoleKey} />
        <input name="parentAccountId" type="hidden" value={parentAccountId} />
        <input name="agentId" type="hidden" value={agentId} />
        <input name="professorId" type="hidden" value={professorId} />

        <InvitationTypeGuide
          agentId={agentId}
          invitationType={selectedInvitationType}
          parentAccountId={parentAccountId}
          professorId={professorId}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor="invitationType">
              {t("admin.invitations.field.invitationType", "ko")}
            </FieldLabel>
            <select
              className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
              id="invitationType"
              name="invitationType"
              onChange={handleInvitationTypeChange}
              required
              value={selectedInvitationType}
            >
              {ADMIN_INVITATION_TYPES.map((type) => (
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
              onChange={(event) => setTargetRoleKey(event.target.value)}
              required
              value={targetRoleKey}
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
              placeholder="/signup/invitation"
            />
          </div>
        </div>

        {selectedInvitationType === "buyer_agent_invite" ? (
          <AgentSelector
            agents={parentOptions.agents}
            onSelect={handleAgentSelect}
            selectedAgentId={agentId}
            selectorError={parentSelectorError}
          />
        ) : null}

        {selectedInvitationType === "student_professor_invite" ? (
          <ProfessorSelector
            onSelect={handleProfessorSelect}
            professors={parentOptions.professors}
            selectedProfessorId={professorId}
            selectorError={parentSelectorError}
          />
        ) : null}

        <div className="rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-3">
          <p className="type-caption-strong text-calm-ink">
            {t("admin.invitations.guide.publicTypesHidden", "ko")}
          </p>
          <p className="type-caption mt-1 text-calm-ink-muted-80">
            {t("admin.invitations.guide.publicTypesHiddenDescription", "ko")}
          </p>
        </div>

        <details className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4">
          <summary className="cursor-pointer type-caption-strong text-calm-ink">
            {t("admin.invitations.create.manualTitle", "ko")}
          </summary>
          <p className="type-caption mt-2 text-calm-ink-muted-80">
            {t("admin.invitations.create.manualDescription", "ko")}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="parentRoleKey">
                {t("admin.invitations.field.parentRole", "ko")}
              </FieldLabel>
              <select
                className="min-h-11 rounded-xl border border-calm-hairline bg-white px-3 type-caption text-calm-ink outline-none transition focus:border-action-blue"
                id="parentRoleKey"
                onChange={(event) => setParentRoleKey(event.target.value)}
                required={Boolean(requiredParentRole)}
                value={parentRoleKey}
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
              <TextInput
                id="parentAccountId"
                onChange={(event) => setParentAccountId(event.target.value)}
                required={Boolean(requiredParentRole)}
                value={parentAccountId}
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="agentId">
                {t("admin.invitations.field.agentId", "ko")}
              </FieldLabel>
              <TextInput
                id="agentId"
                onChange={(event) => setAgentId(event.target.value)}
                required={selectedInvitationType === "buyer_agent_invite"}
                value={agentId}
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="professorId">
                {t("admin.invitations.field.professorId", "ko")}
              </FieldLabel>
              <TextInput
                id="professorId"
                onChange={(event) => setProfessorId(event.target.value)}
                required={selectedInvitationType === "student_professor_invite"}
                value={professorId}
              />
            </div>
            <div className="grid gap-2 lg:col-span-2">
              <FieldLabel htmlFor="companyId">
                {t("admin.invitations.field.companyId", "ko")}
              </FieldLabel>
              <TextInput id="companyId" name="companyId" />
            </div>
          </div>
        </details>

        <SubmitButton />
      </form>
    </section>
  );
}
