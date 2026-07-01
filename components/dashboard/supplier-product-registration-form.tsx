import Link from "next/link";
import { Badge } from "@/components/shared/badge";
import {
  DocumentCheckIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import {
  PRODUCT_REGISTRATION_FIELD_TEMPLATE,
  type StaticProductRegistrationField,
} from "@/lib/products/static-products";

function groupFields(fields: StaticProductRegistrationField[]) {
  return fields.reduce<Record<string, StaticProductRegistrationField[]>>((groups, field) => {
    groups[field.group] = [...(groups[field.group] ?? []), field];
    return groups;
  }, {});
}

function FieldBadge({ children }: Readonly<{ children: string }>) {
  return (
    <span className="rounded-full bg-action-blue/8 px-2.5 py-1 type-fine-print font-semibold capitalize text-action-blue">
      {children}
    </span>
  );
}

function RegistrationInput({ field }: Readonly<{ field: StaticProductRegistrationField }>) {
  const baseClass =
    "w-full rounded-[16px] border border-calm-hairline bg-white px-4 py-3 type-body text-calm-ink outline-none transition placeholder:text-calm-ink-muted-48 focus:border-action-blue focus:ring-4 focus:ring-action-blue/10";

  if (field.inputType === "textarea") {
    return (
      <textarea
        className={`${baseClass} min-h-[132px] resize-y`}
        name={field.id}
        placeholder={field.placeholder}
        rows={5}
      />
    );
  }

  if (field.inputType === "select") {
    return (
      <select className={baseClass} defaultValue="" name={field.id}>
        <option disabled value="">
          {field.placeholder ?? "Select option"}
        </option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.inputType === "file") {
    return (
      <div className="rounded-[16px] border border-dashed border-action-blue/24 bg-action-blue/5 p-4">
        <input
          className="w-full type-caption text-calm-ink-muted-64 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:type-button-utility file:text-action-blue"
          disabled
          name={field.id}
          type="file"
        />
        <p className="mt-2 type-fine-print text-calm-ink-muted-48">
          Upload is disabled until Storage, approval review, and file access rules are connected.
        </p>
      </div>
    );
  }

  return (
    <input
      className={baseClass}
      name={field.id}
      placeholder={field.placeholder}
      type={field.inputType === "url" ? "url" : "text"}
    />
  );
}

function RegistrationField({ field }: Readonly<{ field: StaticProductRegistrationField }>) {
  return (
    <label className="grid gap-2 rounded-[18px] border border-calm-hairline bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.025)]">
      <span className="flex flex-wrap items-start justify-between gap-3">
        <span>
          <span className="type-caption-strong text-calm-ink">{field.label}</span>
          {field.helpText ? (
            <span className="mt-1 block type-fine-print leading-5 text-calm-ink-muted-48">
              {field.helpText}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 flex-wrap gap-1.5">
          <FieldBadge>{field.requirement}</FieldBadge>
          <FieldBadge>{field.publicDisplay}</FieldBadge>
        </span>
      </span>
      <RegistrationInput field={field} />
    </label>
  );
}

function ApprovalStep({
  description,
  index,
  title,
}: Readonly<{
  description: string;
  index: number;
  title: string;
}>) {
  return (
    <article className="flex gap-3 rounded-[18px] border border-calm-hairline bg-white p-4">
      <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-action-blue/10 type-caption-strong text-action-blue">
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <h3 className="type-body-strong text-calm-ink">{title}</h3>
        <p className="type-caption mt-1 text-calm-ink-muted-64">{description}</p>
      </div>
    </article>
  );
}

export function SupplierProductRegistrationForm() {
  const groupedFields = groupFields(PRODUCT_REGISTRATION_FIELD_TEMPLATE);
  const approvalSteps = [
    {
      description: "Supplier role and company status must be approved before public product exposure.",
      title: "Supplier approval",
    },
    {
      description: "Product fields, images, certificates, and documents are reviewed before publishing.",
      title: "Product review",
    },
    {
      description: "Published product pages hide pricing and route buyer interest through managed RFQ.",
      title: "Protected marketplace",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <nav className="flex flex-wrap items-center gap-2 type-caption-strong text-calm-ink-muted-48">
        <Link className="text-action-blue" href="/dashboard/products">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span>New product registration</span>
      </nav>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-action-blue/16 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eaf4ff_100%)] p-6 shadow-[0_24px_70px_rgba(0,102,204,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <Badge dot={false} tone="info">
              Supplier product workspace
            </Badge>
            <h1 className="type-display-md mt-4 max-w-4xl text-calm-ink">
              Prepare structured product data for admin-reviewed marketplace publishing.
            </h1>
            <p className="type-body mt-4 max-w-3xl text-calm-ink-muted-80">
              This page mirrors the product detail data model: image gallery, certificates, product
              details, company information, and review readiness. Submission is intentionally disabled
              until the product migration, RLS, Storage, and approval workflow are connected.
            </p>
          </div>

          <aside className="grid gap-3 rounded-[24px] border border-action-blue/12 bg-white/86 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.045)]">
            <div className="flex gap-3">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-action-blue/10 text-action-blue">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="type-body-strong text-calm-ink">Buyer privacy stays protected</h2>
                <p className="type-caption mt-1 text-calm-ink-muted-64">
                  Product registration never asks for buyer email, phone, or contact person.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-action-blue/10 text-action-blue">
                <DocumentCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="type-body-strong text-calm-ink">Approval before exposure</h2>
                <p className="type-caption mt-1 text-calm-ink-muted-64">
                  Company and product approval remain separate gates before public listing.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="grid gap-5 rounded-[28px] border border-calm-hairline bg-calm-surface p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
          {Object.entries(groupedFields).map(([group, fields]) => (
            <section className="grid gap-3" key={group}>
              <div>
                <p className="type-caption-strong text-action-blue">{group}</p>
                <p className="type-fine-print mt-1 text-calm-ink-muted-48">
                  Fields marked visible or summary can appear on public product detail after approval.
                  Hidden fields stay internal until access rules are defined.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {fields.map((field) => (
                  <RegistrationField field={field} key={field.id} />
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-[20px] border border-action-blue/16 bg-white p-5">
            <p className="type-caption-strong text-action-blue">Submission deferred</p>
            <h2 className="type-title-sm mt-2 text-calm-ink">
              Product submit will open after schema, RLS, Storage, and approval workflow are ready.
            </h2>
            <p className="type-caption mt-2 text-calm-ink-muted-64">
              The form is editable for UX review only. It does not create products, files, inquiries,
              pricing, buyer data, or public records.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="pill-primary opacity-60" disabled type="submit">
                Submit for admin review
              </button>
              <Link className="pill-secondary" href="/dashboard/products">
                Back to products
              </Link>
            </div>
          </div>
        </form>

        <aside className="grid gap-6 self-start lg:sticky lg:top-28">
          <section className="rounded-[24px] border border-calm-hairline bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <p className="type-caption-strong text-action-blue">Approval path</p>
            <h2 className="type-title-sm mt-2 text-calm-ink">How this becomes public</h2>
            <div className="mt-5 grid gap-3">
              {approvalSteps.map((step, index) => (
                <ApprovalStep
                  description={step.description}
                  index={index + 1}
                  key={step.title}
                  title={step.title}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-[#08111f] p-6 text-white shadow-[0_22px_60px_rgba(8,17,31,0.18)]">
            <p className="type-caption-strong text-[#9ecbff]">Not collected here</p>
            <ul className="mt-4 grid gap-3 type-caption text-white/72">
              <li>Public product price</li>
              <li>Buyer contact information</li>
              <li>Direct supplier-buyer contact permission</li>
              <li>Unapproved document downloads</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
