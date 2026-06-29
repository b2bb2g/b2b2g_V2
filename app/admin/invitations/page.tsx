import type { Metadata } from "next";
import { InvitationCreateForm } from "@/components/admin/invitation-create-form";
import { InvitationList } from "@/components/admin/invitation-list";
import { Badge } from "@/components/shared/badge";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";
import { listInvitationsForAdmin } from "@/lib/invitations/queries";
import type { InvitationAdminRecord } from "@/lib/invitations/types";

type AdminInvitationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResultStatus = "error" | "revoked";

export const metadata: Metadata = {
  title: t("admin.invitations.title", "ko"),
};

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getResult(value: string | string[] | undefined): ResultStatus | null {
  const result = getSingle(value);

  if (result === "error" || result === "revoked") {
    return result;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : t("admin.invitations.error.unknown", "ko");
}

export default async function AdminInvitationsPage({
  searchParams,
}: AdminInvitationsPageProps) {
  await requireAdminRoute();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  let invitations: InvitationAdminRecord[] = [];
  let queryError: string | null = null;

  try {
    invitations = await listInvitationsForAdmin();
  } catch (error) {
    queryError = getErrorMessage(error);
  }

  return (
    <main className="admin-page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge dot={false} tone="info">
            {t("admin.invitations.eyebrow", "ko")}
          </Badge>
          <h1 className="type-display-md mt-3 text-calm-ink">
            {t("admin.invitations.title", "ko")}
          </h1>
          <p className="type-body mt-3 max-w-3xl text-calm-ink-muted-80">
            {t("admin.invitations.description", "ko")}
          </p>
        </div>
        <div className="rounded-2xl border border-calm-hairline bg-white px-5 py-4 text-right">
          <p className="type-caption text-calm-ink-muted-48">
            {t("admin.invitations.total", "ko")}
          </p>
          <p className="type-display-md mt-1 text-action-blue">{invitations.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,420px)_1fr]">
        <InvitationCreateForm />
        <InvitationList
          invitations={invitations}
          queryError={queryError}
          result={getResult(resolvedSearchParams.result)}
        />
      </div>
    </main>
  );
}
