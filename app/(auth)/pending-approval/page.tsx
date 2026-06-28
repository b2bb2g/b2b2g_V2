import type { Metadata } from "next";
import Link from "next/link";
import { t } from "@/lib/i18n/translation";

export const metadata: Metadata = {
  title: t("pendingApproval.title"),
};

export default function PendingApprovalPage() {
  return (
    <section className="w-full rounded-[18px] border border-calm-hairline bg-canvas p-8 sm:p-10">
      <p className="type-caption-strong text-action-blue">{t("pendingApproval.eyebrow")}</p>
      <h1 className="type-display-md mt-3 text-calm-ink">{t("pendingApproval.title")}</h1>
      <p className="type-body mt-3 max-w-xl text-calm-ink-muted-80">
        {t("pendingApproval.description")}
      </p>
      <Link className="pill-secondary mt-6" href="/">
        {t("pendingApproval.backHome")}
      </Link>
    </section>
  );
}
