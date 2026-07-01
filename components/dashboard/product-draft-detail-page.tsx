import Link from "next/link";
import { Badge, StatusBadge } from "@/components/shared/badge";
import {
  DocumentCheckIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import {
  PRODUCT_REGISTRATION_FIELD_TEMPLATE,
  type StaticProductRegistrationField,
} from "@/lib/products/static-products";
import type {
  SupplierProductDraftDetail,
  SupplierProductDraftValue,
} from "@/lib/queries/products";

type DashboardProductDraftDetailPageProps = {
  draft: SupplierProductDraftDetail;
};

function getFieldTemplate(fieldKey: string): StaticProductRegistrationField | undefined {
  return PRODUCT_REGISTRATION_FIELD_TEMPLATE.find((field) => field.id === fieldKey);
}

function getValueLabel(value: SupplierProductDraftValue) {
  return getFieldTemplate(value.fieldKey)?.label ?? value.fieldKey;
}

function getValueGroup(value: SupplierProductDraftValue) {
  return getFieldTemplate(value.fieldKey)?.group ?? value.groupKey;
}

function groupDraftValues(values: SupplierProductDraftValue[]) {
  return values.reduce<Record<string, SupplierProductDraftValue[]>>((groups, value) => {
    const group = getValueGroup(value);
    groups[group] = [...(groups[group] ?? []), value];
    return groups;
  }, {});
}

function DraftMetric({
  label,
  value,
}: Readonly<{
  label: string;
  value: string | number;
}>) {
  return (
    <article className="rounded-[18px] border border-action-blue/12 bg-white/82 p-4 shadow-[0_12px_28px_rgba(0,102,204,0.045)]">
      <p className="type-fine-print text-calm-ink-muted-48">{label}</p>
      <p className="type-title-sm mt-2 text-calm-ink">{value}</p>
    </article>
  );
}

function DraftValueCard({ value }: Readonly<{ value: SupplierProductDraftValue }>) {
  const template = getFieldTemplate(value.fieldKey);

  return (
    <article className="rounded-[18px] border border-calm-hairline bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.025)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="type-caption-strong text-calm-ink">{getValueLabel(value)}</h3>
          {template?.helpText ? (
            <p className="type-fine-print mt-1 text-calm-ink-muted-48">{template.helpText}</p>
          ) : null}
        </div>
        <Badge dot={false} tone={value.publicDisplay === "hidden" ? "neutral" : "info"}>
          {value.publicDisplay}
        </Badge>
      </div>
      <p className="type-caption mt-4 whitespace-pre-wrap text-calm-ink-muted-80">
        {value.valueText || t("dashboard.products.draftDetail.emptyValue")}
      </p>
    </article>
  );
}

export function DashboardProductDraftDetailPage({
  draft,
}: Readonly<DashboardProductDraftDetailPageProps>) {
  const groupedValues = groupDraftValues(draft.values);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <nav className="flex flex-wrap items-center gap-2 type-caption-strong text-calm-ink-muted-48">
        <Link className="text-action-blue" href="/dashboard/products">
          {t("dashboard.products.title")}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{t("dashboard.products.draftDetail.breadcrumb")}</span>
      </nav>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-action-blue/16 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eaf4ff_100%)] p-6 shadow-[0_24px_70px_rgba(0,102,204,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <Badge dot={false} tone="info">
              {t("dashboard.products.draftDetail.eyebrow")}
            </Badge>
            <h1 className="type-display-md mt-4 max-w-4xl text-calm-ink">
              {draft.title}
            </h1>
            <p className="type-body mt-4 max-w-3xl text-calm-ink-muted-80">
              {draft.summary ?? draft.description ?? t("dashboard.products.record.noDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusBadge value={draft.approvalStatus} />
              <Badge dot={false} tone="neutral">
                {draft.publishStatus}
              </Badge>
            </div>
          </div>

          <aside className="grid gap-3 rounded-[24px] border border-action-blue/12 bg-white/86 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.045)]">
            <div className="flex gap-3">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-action-blue/10 text-action-blue">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="type-body-strong text-calm-ink">
                  {t("dashboard.products.draftDetail.privateTitle")}
                </h2>
                <p className="type-caption mt-1 text-calm-ink-muted-64">
                  {t("dashboard.products.draftDetail.privateDescription")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-action-blue/10 text-action-blue">
                <DocumentCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="type-body-strong text-calm-ink">
                  {t("dashboard.products.draftDetail.uploadTitle")}
                </h2>
                <p className="type-caption mt-1 text-calm-ink-muted-64">
                  {t("dashboard.products.draftDetail.uploadDescription")}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <DraftMetric
            label={t("dashboard.products.draftDetail.metric.fields")}
            value={draft.valuesCount}
          />
          <DraftMetric
            label={t("dashboard.products.draftDetail.metric.created")}
            value={draft.createdAt.slice(0, 10)}
          />
          <DraftMetric
            label={t("dashboard.products.draftDetail.metric.updated")}
            value={draft.updatedAt.slice(0, 10)}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5 rounded-[28px] border border-calm-hairline bg-calm-surface p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
          {Object.entries(groupedValues).length > 0 ? (
            Object.entries(groupedValues).map(([group, values]) => (
              <section className="grid gap-3" key={group}>
                <div>
                  <p className="type-caption-strong text-action-blue">{group}</p>
                  <p className="type-fine-print mt-1 text-calm-ink-muted-48">
                    {t("dashboard.products.draftDetail.groupDescription")}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {values.map((value) => (
                    <DraftValueCard key={value.fieldKey} value={value} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-action-blue/20 bg-action-blue/5 p-6 text-center">
              <p className="type-body text-calm-ink-muted-64">
                {t("dashboard.products.draftDetail.noValues")}
              </p>
            </div>
          )}
        </div>

        <aside className="grid gap-6 self-start lg:sticky lg:top-28">
          <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <p className="type-caption-strong text-action-blue">
              {t("dashboard.products.draftDetail.next.eyebrow")}
            </p>
            <h2 className="type-title-sm mt-2 text-calm-ink">
              {t("dashboard.products.draftDetail.next.title")}
            </h2>
            <div className="mt-5 grid gap-3">
              {[
                "dashboard.products.draftDetail.next.storage",
                "dashboard.products.draftDetail.next.review",
                "dashboard.products.draftDetail.next.publish",
              ].map((key, index) => (
                <article
                  className="flex gap-3 rounded-[18px] border border-calm-hairline bg-calm-surface p-4"
                  key={key}
                >
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-action-blue/10 type-caption-strong text-action-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="type-caption text-calm-ink-muted-80">{t(key)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-[#08111f] p-6 text-white shadow-[0_22px_60px_rgba(8,17,31,0.18)]">
            <p className="type-caption-strong text-[#9ecbff]">
              {t("dashboard.products.draftDetail.blockedTitle")}
            </p>
            <ul className="mt-4 grid gap-3 type-caption text-white/72">
              <li>{t("dashboard.products.draftDetail.blocked.upload")}</li>
              <li>{t("dashboard.products.draftDetail.blocked.publish")}</li>
              <li>{t("dashboard.products.draftDetail.blocked.inquiry")}</li>
              <li>{t("dashboard.products.draftDetail.blocked.price")}</li>
            </ul>
          </section>

          <Link className="pill-secondary justify-center" href="/dashboard/products">
            {t("dashboard.products.draftDetail.back")}
          </Link>
        </aside>
      </section>
    </main>
  );
}
