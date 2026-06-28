import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/shared/badge";
import {
  BoxIcon,
  DatabaseIcon,
  GridIcon,
  PulseIcon,
  UsersIcon,
} from "@/components/shared/icons";
import {
  ArrowUpRightIcon,
  BadgeIcon,
  BoltIcon,
  GlobeIcon,
  HandshakeIcon,
  MailIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import { requireAdminRoute } from "@/lib/auth/guards";
import { t } from "@/lib/i18n/translation";

type AdminModulePageProps = {
  params: Promise<{ module: string }>;
};

type AdminModule = {
  controls: string[];
  descriptionKey: string;
  href: string;
  icon: typeof GridIcon;
  labelKey: string;
  statusKey: string;
};

const adminModules: Record<string, AdminModule> = {
  "audit": {
    controls: ["admin.module.control.audit", "admin.module.control.rls", "admin.module.control.security"],
    descriptionKey: "admin.module.audit.description",
    href: "/admin/audit",
    icon: ShieldCheckIcon,
    labelKey: "admin.nav.audit",
    statusKey: "admin.module.status.designReady",
  },
  "buy-sell": {
    controls: ["admin.module.control.buyRequests", "admin.module.control.sellProducts", "admin.module.control.quotation"],
    descriptionKey: "admin.module.buySell.description",
    href: "/admin/buy-sell",
    icon: HandshakeIcon,
    labelKey: "admin.nav.buySell",
    statusKey: "admin.module.status.designReady",
  },
  "events": {
    controls: ["admin.module.control.events", "admin.module.control.applications", "admin.module.control.programs"],
    descriptionKey: "admin.module.events.description",
    href: "/admin/events",
    icon: PulseIcon,
    labelKey: "admin.nav.events",
    statusKey: "admin.module.status.designReady",
  },
  "fda": {
    controls: ["admin.module.control.fdaApplications", "admin.module.control.documents", "admin.module.control.quotes"],
    descriptionKey: "admin.module.fda.description",
    href: "/admin/fda",
    icon: BoltIcon,
    labelKey: "admin.nav.fda",
    statusKey: "admin.module.status.designReady",
  },
  "landing": {
    controls: ["admin.module.control.sections", "admin.module.control.banners", "admin.module.control.copy"],
    descriptionKey: "admin.module.landing.description",
    href: "/admin/landing",
    icon: GlobeIcon,
    labelKey: "admin.nav.landing",
    statusKey: "admin.module.status.contentReady",
  },
  "messages": {
    controls: ["admin.module.control.conversations", "admin.module.control.attachments", "admin.module.control.blocking"],
    descriptionKey: "admin.module.messages.description",
    href: "/admin/messages",
    icon: MailIcon,
    labelKey: "admin.nav.messages",
    statusKey: "admin.module.status.designReady",
  },
  "network": {
    controls: ["admin.module.control.referrals", "admin.module.control.agents", "admin.module.control.ambassadors"],
    descriptionKey: "admin.module.network.description",
    href: "/admin/network",
    icon: UsersIcon,
    labelKey: "admin.nav.network",
    statusKey: "admin.module.status.designReady",
  },
  "products": {
    controls: ["admin.module.control.products", "admin.module.control.categories", "admin.module.control.files"],
    descriptionKey: "admin.module.products.description",
    href: "/admin/products",
    icon: BoxIcon,
    labelKey: "admin.nav.products",
    statusKey: "admin.module.status.designReady",
  },
  "projects": {
    controls: ["admin.module.control.industrial", "admin.module.control.epc", "admin.module.control.projectMatching"],
    descriptionKey: "admin.module.projects.description",
    href: "/admin/projects",
    icon: GridIcon,
    labelKey: "admin.nav.projects",
    statusKey: "admin.module.status.designReady",
  },
  "rewards": {
    controls: ["admin.module.control.rewards", "admin.module.control.badges", "admin.module.control.ranks"],
    descriptionKey: "admin.module.rewards.description",
    href: "/admin/rewards",
    icon: BadgeIcon,
    labelKey: "admin.home.menu.rewards",
    statusKey: "admin.module.status.designReady",
  },
  "settings": {
    controls: ["admin.module.control.menus", "admin.module.control.settings", "admin.module.control.translations"],
    descriptionKey: "admin.module.settings.description",
    href: "/admin/settings",
    icon: DatabaseIcon,
    labelKey: "admin.nav.settings",
    statusKey: "admin.module.status.designReady",
  },
  "translations": {
    controls: ["admin.module.control.translationKeys", "admin.module.control.languages", "admin.module.control.copy"],
    descriptionKey: "admin.module.translations.description",
    href: "/admin/translations",
    icon: GlobeIcon,
    labelKey: "admin.nav.translations",
    statusKey: "admin.module.status.designReady",
  },
};

export const metadata: Metadata = {
  title: t("admin.module.title", "ko"),
};

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  await requireAdminRoute();

  const { module } = await params;
  const config = adminModules[module] ?? adminModules.settings;
  const Icon = config.icon;

  return (
    <main className="admin-page-frame">
      <section className="overflow-hidden rounded-[32px] border border-calm-hairline bg-white shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <Badge dot={false} tone="info">
              {t(config.statusKey, "ko")}
            </Badge>
            <div className="mt-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-action-blue text-white shadow-[0_14px_32px_rgb(11_99_206/0.18)]">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-[38px] font-semibold tracking-[-0.035em] text-calm-ink">
                  {t(config.labelKey, "ko")}
                </h1>
                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-calm-ink-muted-80">
                  {t(config.descriptionKey, "ko")}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="pill-primary" href="/admin">
                {t("admin.module.back", "ko")}
              </Link>
              <Link className="calm-chip" href="/admin/content">
                {t("admin.module.approvalQueue", "ko")}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <aside className="rounded-[28px] bg-canvas-parchment p-5">
            <p className="text-[13px] font-bold text-action-blue">
              {t("admin.module.controls", "ko")}
            </p>
            <div className="mt-4 grid gap-3">
              {config.controls.map((controlKey, index) => (
                <article className="rounded-2xl border border-calm-hairline bg-white p-4" key={controlKey}>
                  <p className="text-[12px] font-semibold text-action-blue">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-[14px] font-semibold text-calm-ink">
                    {t(controlKey, "ko")}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
