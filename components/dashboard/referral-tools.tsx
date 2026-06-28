"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, StatusBadge } from "@/components/shared/badge";
import { t } from "@/lib/i18n/translation";
import type {
  DashboardNetworkContact,
  DashboardRecord,
  DashboardReferralTreeNode,
} from "@/lib/queries/dashboard";

export function CopyReferralButton({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent("b2bb2g:toast", {
          detail: {
            message: t("dashboard.referrals.copy.done"),
            tone: "success",
          },
        }),
      );
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.dispatchEvent(
        new CustomEvent("b2bb2g:toast", {
          detail: {
            message: t("dashboard.referrals.copy.failed"),
            tone: "warning",
          },
        }),
      );
    }
  }

  return (
    <button className="dashboard-copy-button" onClick={copyValue} type="button">
      {copied ? t("dashboard.referrals.copy.copied") : label}
    </button>
  );
}

export function ReferralShareButton({
  text,
  title,
  url,
}: Readonly<{
  text: string;
  title: string;
  url: string;
}>) {
  async function shareReferral() {
    if (navigator.share) {
      try {
        await navigator.share({ text, title, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.dispatchEvent(
        new CustomEvent("b2bb2g:toast", {
          detail: {
            message: t("dashboard.referrals.share.copied"),
            tone: "success",
          },
        }),
      );
    } catch {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url}`)}`;
    }
  }

  return (
    <button className="dashboard-copy-button dashboard-share-button" onClick={shareReferral} type="button">
      {t("dashboard.referrals.share.button")}
    </button>
  );
}

export function ReferralQrCard({
  code,
  url,
}: Readonly<{
  code: string;
  url: string;
}>) {
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`;

  return (
    <div className="dashboard-referral-qr-card">
      <div className="dashboard-referral-qr-image">
        <Image
          alt={t("dashboard.referrals.qr.alt")}
          height={86}
          src={qrSource}
          unoptimized
          width={86}
        />
      </div>
      <div>
        <p>{t("dashboard.referrals.qr.title")}</p>
        <span>{code}</span>
        <a href={qrSource} rel="noreferrer" target="_blank">
          {t("dashboard.referrals.qr.open")}
        </a>
      </div>
    </div>
  );
}

function getReferralRecordKey(record: DashboardRecord, index: number, scope: string) {
  return [
    scope,
    record.href ?? "no-href",
    record.status ?? "no-status",
    record.title,
    record.meta ?? "no-meta",
    index,
  ].join(":");
}

function getReferralTreeKey(node: DashboardReferralTreeNode, index: number, path: string) {
  return [
    path,
    node.badge,
    node.status ?? "no-status",
    node.title,
    node.meta ?? "no-meta",
    index,
  ].join(":");
}

export function ReferralMentorCard({
  contact,
}: Readonly<{
  contact: DashboardNetworkContact;
}>) {
  return (
    <section className="mt-6 rounded-[28px] border border-action-blue/20 bg-white/95 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.referrals.mentor.kicker")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="type-section-title text-calm-ink-strong">
              {contact.title}
            </h2>
            <Badge dot={false} tone="info">
              {contact.badge}
            </Badge>
            <StatusBadge value={contact.status} />
          </div>
          <p className="mt-3 max-w-3xl type-body text-calm-ink-muted-64">
            {contact.description ?? t("dashboard.referrals.mentor.description")}
          </p>
        </div>
        <div className="grid min-w-[280px] gap-3 rounded-[22px] border border-soft-blue-200 bg-soft-blue-50/70 p-4">
          <div>
            <span className="type-fine-print text-calm-ink-muted-48">
              {t("dashboard.referrals.mentor.university")}
            </span>
            <p className="type-caption-strong text-calm-ink-strong">
              {contact.meta ?? t("dashboard.common.notAssigned")}
            </p>
          </div>
          <div>
            <span className="type-fine-print text-calm-ink-muted-48">
              {t("dashboard.referrals.mentor.email")}
            </span>
            <p className="type-caption-strong text-calm-ink-strong">
              {contact.email ?? t("dashboard.common.notAssigned")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="pill-primary" href={contact.href}>
              {t("dashboard.referrals.mentor.message")}
            </Link>
            {contact.email ? (
              <CopyReferralButton
                label={t("dashboard.referrals.mentor.copyEmail")}
                value={contact.email}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReferralStudentRoster({
  contacts,
}: Readonly<{
  contacts: DashboardNetworkContact[];
}>) {
  return (
    <section className="mt-6 rounded-[28px] border border-action-blue/20 bg-white/95 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.referrals.students.kicker")}
          </p>
          <h2 className="mt-2 type-section-title text-calm-ink-strong">
            {t("dashboard.referrals.students.title")}
          </h2>
          <p className="mt-2 max-w-3xl type-body text-calm-ink-muted-64">
            {t("dashboard.referrals.students.description")}
          </p>
        </div>
        <Badge dot={false} tone="info">
          {contacts.length}
        </Badge>
      </div>

      {contacts.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {contacts.slice(0, 8).map((contact, index) => (
            <article
              className="rounded-[22px] border border-soft-blue-200 bg-soft-blue-50/60 p-4"
              key={`${contact.title}:${contact.email ?? "no-email"}:${index}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge dot={false} tone="info">
                  {contact.badge}
                </Badge>
                <StatusBadge value={contact.status} />
              </div>
              <h3 className="mt-3 type-card-title text-calm-ink-strong">
                {contact.title}
              </h3>
              <p className="mt-1 type-caption text-calm-ink-muted-64">
                {contact.meta ?? t("dashboard.common.notAssigned")}
              </p>
              {contact.description ? (
                <p className="mt-3 type-caption text-calm-ink-muted-64">
                  {contact.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="pill-secondary" href={contact.href}>
                  {t("dashboard.referrals.students.message")}
                </Link>
                {contact.email ? (
                  <CopyReferralButton
                    label={t("dashboard.referrals.mentor.copyEmail")}
                    value={contact.email}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 dashboard-referral-empty">
          {t("dashboard.referrals.students.empty")}
        </p>
      )}
    </section>
  );
}

export function ReferralLookupPanel({
  emptyKey,
  records,
}: Readonly<{
  emptyKey: string;
  records: DashboardRecord[];
}>) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecords = useMemo(() => {
    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) =>
      [record.title, record.meta, record.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, records]);

  return (
    <section className="dashboard-referral-lookup">
      <div className="dashboard-referral-lookup-head">
        <div>
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.referrals.lookup.kicker")}
          </p>
          <h2>{t("dashboard.referrals.lookup.title")}</h2>
        </div>
        <Badge dot={false} tone="neutral">
          {filteredRecords.length}
        </Badge>
      </div>
      <input
        className="dashboard-referral-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("dashboard.referrals.lookup.placeholder")}
        type="search"
        value={query}
      />
      <div className="dashboard-referral-records">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <article
              className="dashboard-referral-record"
              key={getReferralRecordKey(record, index, "lookup")}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={record.status} />
                  {record.meta ? (
                    <span className="type-fine-print text-calm-ink-muted-48">{record.meta}</span>
                  ) : null}
                </div>
                <h3>{record.title.startsWith("dashboard.") ? t(record.title) : record.title}</h3>
              </div>
            </article>
          ))
        ) : (
          <p className="dashboard-referral-empty">{t(emptyKey)}</p>
        )}
      </div>
    </section>
  );
}

function ReferralTreeBranch({
  node,
  path,
}: Readonly<{ node: DashboardReferralTreeNode; path: string }>) {
  return (
    <article className="dashboard-referral-tree-node">
      <div className="dashboard-referral-tree-line" />
      <div className="dashboard-referral-tree-body">
        <div className="dashboard-referral-tree-topline">
          <Badge dot={false} tone="info">
            {node.badge}
          </Badge>
          <StatusBadge value={node.status} />
        </div>
        <h3>{node.title}</h3>
        {node.meta ? <p>{node.meta}</p> : null}
        {node.children && node.children.length > 0 ? (
          <div className="dashboard-referral-tree-children">
            {node.children.map((child, index) => (
              <ReferralTreeBranch
                key={getReferralTreeKey(child, index, path)}
                node={child}
                path={`${path}.${index}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function countTreeNodes(nodes: DashboardReferralTreeNode[]): number {
  return nodes.reduce((count, node) => count + 1 + countTreeNodes(node.children ?? []), 0);
}

export function ReferralTreeView({
  emptyKey,
  tree,
}: Readonly<{
  emptyKey: string;
  tree: DashboardReferralTreeNode[];
}>) {
  const totalNodes = countTreeNodes(tree);
  const hasScrollableTree = totalNodes > 5;

  return (
    <section className="dashboard-referral-tree">
      <div className="dashboard-referral-lookup-head">
        <div>
          <p className="type-caption-strong text-action-blue">
            {t("dashboard.referrals.tree.kicker")}
          </p>
          <h2>{t("dashboard.referrals.tree.title")}</h2>
        </div>
        <Badge dot={false} tone="neutral">
          {totalNodes}
        </Badge>
      </div>
      <p className="dashboard-referral-tree-description">
        {t("dashboard.referrals.tree.description")}
      </p>
      {hasScrollableTree ? (
        <p className="dashboard-referral-tree-helper">
          {t("dashboard.referrals.tree.scrollHint")}
        </p>
      ) : null}
      <div className="dashboard-referral-tree-scroll">
        <div className="dashboard-referral-tree-list">
          {tree.length > 0 ? (
            tree.map((node, index) => (
              <ReferralTreeBranch
                key={getReferralTreeKey(node, index, "root")}
                node={node}
                path={`root.${index}`}
              />
            ))
          ) : (
            <p className="dashboard-referral-empty">{t(emptyKey)}</p>
          )}
        </div>
      </div>
    </section>
  );
}
