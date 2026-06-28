import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { updateSignupPolicyAction } from "@/lib/actions/admin-settings";
import { Badge, type BadgeTone } from "@/components/shared/badge";
import {
  BoxIcon,
  BuildingIcon,
  DatabaseIcon,
  GridIcon,
  PulseIcon,
  UsersIcon,
} from "@/components/shared/icons";
import {
  ArrowUpRightIcon,
  BadgeIcon,
  BoltIcon,
  DocumentCheckIcon,
  GlobeIcon,
  HandshakeIcon,
  MailIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import type { AdminOverview } from "@/lib/queries/admin-overview";

type AdminHomeProps = {
  overview: AdminOverview;
};

type AdminIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => ReactNode;

type ControlModule = {
  badgeCount?: number;
  descriptionKey: string;
  href: string;
  icon: AdminIcon;
  labelKey: string;
  live: boolean;
  tone?: BadgeTone;
};

type ControlGroup = {
  descriptionKey: string;
  items: ControlModule[];
  labelKey: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(count: number): BadgeTone {
  return count > 0 ? "warning" : "positive";
}

function metricTone(value: number, warning = true): BadgeTone {
  if (value === 0) {
    return "positive";
  }

  return warning ? "warning" : "info";
}

function MiniBars({
  barClassName = "bg-action-blue/75",
  values,
}: {
  barClassName?: string;
  values: number[];
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-12 items-end gap-1">
      {values.map((value, index) => (
        <span
          className={`w-2 rounded-t-full ${barClassName}`}
          key={`${value}-${index}`}
          style={{ height: `${Math.max(14, (value / max) * 48)}px` }}
        />
      ))}
    </div>
  );
}

function SignalCard({
  labelKey,
  size = "normal",
  surface = "dark",
  tone,
  value,
}: {
  labelKey: string;
  size?: "normal" | "compact";
  surface?: "dark" | "light";
  tone: BadgeTone;
  value: number;
}) {
  const isDark = surface === "dark";
  const isCompact = size === "compact";

  return (
    <article
      className={`rounded-[20px] border ${
        isCompact ? "p-3.5" : "p-4"
      } ${
        isDark
          ? "border-white/16 bg-white/[0.13] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
          : "border-calm-hairline bg-white text-calm-ink shadow-[0_18px_50px_rgb(15_23_42/0.06)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${
            isDark ? "text-white/45" : "text-calm-ink-muted-48"
          }`}
        >
          {t(labelKey, "ko")}
        </p>
        {isCompact ? null : (
          <Badge dot={false} tone={tone}>
            {t(`admin.home.tone.${tone}`, "ko")}
          </Badge>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className={`${isCompact ? "text-[26px]" : "text-[30px]"} font-semibold leading-none tracking-[-0.02em]`}>
          {value}
        </p>
        <MiniBars
          barClassName={isDark ? "bg-white/72" : "bg-action-blue/72"}
          values={[1, value + 1, 2, value + 3, 1, 3]}
        />
      </div>
    </article>
  );
}

function WorkQueue({ overview }: AdminHomeProps) {
  const workItems = [
    {
      count: overview.members.pendingApproval,
      href: "/admin/members",
      labelKey: "admin.home.work.members",
      metaKey: "admin.home.work.membersMeta",
    },
    {
      count: overview.content.companies,
      href: "/admin/companies",
      labelKey: "admin.home.work.companies",
      metaKey: "admin.home.work.companiesMeta",
    },
    {
      count: overview.content.totalPending,
      href: "/admin/content",
      labelKey: "admin.home.work.content",
      metaKey: "admin.home.work.contentMeta",
    },
    {
      count: overview.fda.activeApplications,
      href: "/admin/fda",
      labelKey: "admin.home.work.fda",
      metaKey: "admin.home.work.fdaMeta",
    },
  ];

  return (
    <section className="rounded-[28px] border border-calm-hairline bg-white p-5 shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold text-action-blue">
            {t("admin.home.workQueue", "ko")}
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-calm-ink">
            {t("admin.home.priorityTitle", "ko")}
          </h2>
        </div>
        <Badge dot={false} tone={statusTone(overview.content.totalPending + overview.members.pendingApproval)}>
          {overview.content.totalPending + overview.members.pendingApproval}
        </Badge>
      </div>
      <div className="mt-5 grid gap-3">
        {workItems.map((item) => (
          <Link
            className="group grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-calm-hairline bg-canvas-parchment px-4 py-4 transition hover:border-action-blue/30 hover:bg-white"
            href={item.href}
            key={item.href}
          >
            <span>
              <span className="block text-[14px] font-semibold text-calm-ink">
                {t(item.labelKey, "ko")}
              </span>
              <span className="mt-1 block text-[12px] text-calm-ink-muted-48">
                {t(item.metaKey, "ko")}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <Badge dot={false} tone={statusTone(item.count)}>
                {item.count}
              </Badge>
              <ArrowUpRightIcon className="h-4 w-4 text-calm-ink-muted-48 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-action-blue" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ControlCard({ item }: { item: ControlModule }) {
  const Icon = item.icon;

  return (
    <Link
      className="group min-h-[174px] rounded-[24px] border border-calm-hairline bg-white p-5 shadow-[0_18px_60px_rgb(15_23_42/0.05)] transition hover:-translate-y-0.5 hover:border-action-blue/35 hover:shadow-[0_22px_70px_rgb(15_23_42/0.10)]"
      href={item.href}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas-parchment text-calm-ink">
          <Icon className="h-5 w-5" />
        </span>
        <Badge dot={item.live} tone={item.live ? item.tone ?? "positive" : "neutral"}>
          {item.badgeCount !== undefined
            ? item.badgeCount
            : t(item.live ? "admin.home.badge.ready" : "admin.home.badge.planned", "ko")}
        </Badge>
      </div>
      <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em] text-calm-ink">
        {t(item.labelKey, "ko")}
      </h3>
      <p className="mt-2 min-h-10 text-[13px] leading-5 text-calm-ink-muted-48">
        {t(item.descriptionKey, "ko")}
      </p>
      <div className="mt-5 flex items-center justify-between text-[13px] font-semibold text-action-blue">
        <span>{t("admin.home.open", "ko")}</span>
        <ArrowUpRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

function ControlGroup({ group }: { group: ControlGroup }) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-calm-ink">
            {t(group.labelKey, "ko")}
          </h2>
          <p className="mt-1 text-[13px] text-calm-ink-muted-48">
            {t(group.descriptionKey, "ko")}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {group.items.map((item) => (
          <ControlCard item={item} key={item.href} />
        ))}
      </div>
    </section>
  );
}

function LandingControlPanel({ overview }: AdminHomeProps) {
  const landingItems = [
    ["admin.home.landing.hero", "admin.home.landing.heroMeta", overview.platform.publicSettings],
    ["admin.home.landing.banners", "admin.home.landing.bannersMeta", overview.platform.banners],
    ["admin.home.landing.featured", "admin.home.landing.featuredMeta", overview.platform.featuredContents],
    ["admin.home.landing.copy", "admin.home.landing.copyMeta", overview.platform.translations],
  ] as const;

  return (
    <section className="rounded-[28px] border border-calm-hairline bg-white p-5 shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-action-blue">
            {t("admin.home.landing.eyebrow", "ko")}
          </p>
          <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-calm-ink">
            {t("admin.home.landing.title", "ko")}
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-calm-ink-muted-80">
            {t("admin.home.landing.description", "ko")}
          </p>
        </div>
        <Link className="pill-primary" href="/admin/landing">
          {t("admin.home.landing.cta", "ko")}
        </Link>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {landingItems.map(([labelKey, metaKey, count]) => (
          <article className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4" key={labelKey}>
            <p className="text-[13px] font-semibold text-calm-ink">{t(labelKey, "ko")}</p>
            <p className="mt-1 text-[12px] leading-5 text-calm-ink-muted-48">{t(metaKey, "ko")}</p>
            <p className="mt-4 text-[24px] font-semibold text-action-blue">{count}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SignupPolicyPanel({ overview }: AdminHomeProps) {
  const isOpen = overview.auth.signupPolicy.allowPublicSignup;

  return (
    <section className="rounded-[28px] border border-calm-hairline bg-white p-5 shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-action-blue">
            {t("admin.home.signupPolicy.eyebrow", "ko")}
          </p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-calm-ink">
            {t("admin.home.signupPolicy.title", "ko")}
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-calm-ink-muted-80">
            {isOpen
              ? t("admin.home.signupPolicy.openDescription", "ko")
              : t("admin.home.signupPolicy.referralDescription", "ko")}
          </p>
        </div>
        <Badge dot={false} tone={isOpen ? "positive" : "warning"}>
          {isOpen
            ? t("admin.home.signupPolicy.openBadge", "ko")
            : t("admin.home.signupPolicy.referralBadge", "ko")}
        </Badge>
      </div>

      <form
        action={updateSignupPolicyAction}
        className={`mt-5 rounded-[26px] border p-2 transition ${
          isOpen
            ? "border-action-blue/30 bg-action-blue/10"
            : "border-amber-300/80 bg-amber-50"
        }`}
        data-action-confirm="true"
        data-confirm-message={
          isOpen
            ? t("feedback.signup.referral.confirm", "ko")
            : t("feedback.signup.open.confirm", "ko")
        }
        data-confirm-tone={isOpen ? "warning" : "info"}
        data-pending-message={t("feedback.pending.save", "ko")}
        data-success-message={t("feedback.success.save", "ko")}
      >
        <input name="allowPublicSignup" type="hidden" value={isOpen ? "false" : "true"} />
        <button
          aria-checked={isOpen}
          className={`group relative grid w-full gap-2 rounded-[22px] p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action-blue sm:grid-cols-2 ${
            isOpen ? "bg-white/74" : "bg-white/82"
          }`}
          role="switch"
          type="submit"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-2 hidden w-[calc(50%_-_4px)] rounded-[18px] shadow-[0_18px_36px_rgb(15_23_42/0.16)] transition-all duration-300 sm:block ${
              isOpen
                ? "left-2 bg-[linear-gradient(135deg,#0b63ce,#0f7dff)]"
                : "left-[calc(50%_+_2px)] bg-[linear-gradient(135deg,#d97706,#f59e0b)]"
            }`}
          />
          <span
            className={`relative z-10 min-h-24 rounded-[18px] border p-4 transition ${
              isOpen
                ? "border-white/20 bg-[linear-gradient(135deg,#0b63ce,#0f7dff)] text-white sm:bg-transparent"
                : "border-transparent text-calm-ink group-hover:bg-action-blue/6"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-bold tracking-[-0.01em]">
                {t("admin.home.signupPolicy.openTitle", "ko")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  isOpen
                    ? "bg-white text-action-blue"
                    : "bg-action-blue/10 text-action-blue"
                }`}
              >
                {isOpen
                  ? t("admin.home.signupPolicy.current", "ko")
                  : t("admin.home.signupPolicy.turnOn", "ko")}
              </span>
            </span>
            <span
              className={`mt-2 block text-[12px] leading-5 ${
                isOpen ? "text-white/78" : "text-calm-ink-muted-48"
              }`}
            >
              {t("admin.home.signupPolicy.openMeta", "ko")}
            </span>
          </span>
          <span
            className={`relative z-10 min-h-24 rounded-[18px] border p-4 transition ${
              !isOpen
                ? "border-white/20 bg-[linear-gradient(135deg,#d97706,#f59e0b)] text-white sm:bg-transparent"
                : "border-transparent text-calm-ink group-hover:bg-amber-100"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-bold tracking-[-0.01em]">
                {t("admin.home.signupPolicy.referralTitle", "ko")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  !isOpen
                    ? "bg-white text-amber-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {!isOpen
                  ? t("admin.home.signupPolicy.current", "ko")
                  : t("admin.home.signupPolicy.turnOff", "ko")}
              </span>
            </span>
            <span
              className={`mt-2 block text-[12px] leading-5 ${
                !isOpen ? "text-white/80" : "text-calm-ink-muted-48"
              }`}
            >
              {t("admin.home.signupPolicy.referralMeta", "ko")}
            </span>
          </span>
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-calm-hairline bg-canvas-parchment p-4">
        <p className="text-[12px] font-semibold text-calm-ink">
          {t("admin.home.signupPolicy.noticeTitle", "ko")}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-calm-ink-muted-48">
          {t("admin.home.signupPolicy.noticeBody", "ko")}
        </p>
      </div>
    </section>
  );
}

function RecentPanel({ overview }: AdminHomeProps) {
  return (
    <section className="rounded-[28px] border border-calm-hairline bg-white p-5 shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-calm-ink">
          {t("admin.home.recentLogs", "ko")}
        </h2>
        <Badge dot={false} tone={overview.alerts.unreadNotifications > 0 ? "warning" : "positive"}>
          {overview.alerts.unreadNotifications}
        </Badge>
      </div>
      <div className="mt-4 divide-y divide-calm-hairline">
        {overview.governance.recentLogs.length > 0 ? (
          overview.governance.recentLogs.map((log) => (
            <article className="py-4" key={`${log.action}:${log.occurred_at}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge dot={false} tone="neutral">
                  {log.action}
                </Badge>
                <span className="text-[11px] text-calm-ink-muted-48">
                  {formatDate(log.occurred_at)}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-calm-ink">
                {log.target_label ?? log.target_table}
              </p>
            </article>
          ))
        ) : (
          <p className="py-8 text-[13px] text-calm-ink-muted-48">
            {t("admin.home.emptyLogs", "ko")}
          </p>
        )}
      </div>
    </section>
  );
}

export function AdminHome({ overview }: AdminHomeProps) {
  const controlGroups: ControlGroup[] = [
    {
      descriptionKey: "admin.home.group.operations.description",
      labelKey: "admin.home.group.operations",
      items: [
        {
          badgeCount: overview.members.pendingApproval,
          descriptionKey: "admin.home.menu.members.description",
          href: "/admin/members",
          icon: UsersIcon,
          labelKey: "admin.home.menu.members",
          live: true,
          tone: statusTone(overview.members.pendingApproval),
        },
        {
          badgeCount: overview.content.companies,
          descriptionKey: "admin.home.menu.companies.description",
          href: "/admin/companies",
          icon: BuildingIcon,
          labelKey: "admin.home.menu.companies",
          live: true,
          tone: statusTone(overview.content.companies),
        },
        {
          badgeCount: overview.content.totalPending,
          descriptionKey: "admin.home.menu.content.description",
          href: "/admin/content",
          icon: DocumentCheckIcon,
          labelKey: "admin.home.menu.content",
          live: true,
          tone: statusTone(overview.content.totalPending),
        },
        {
          badgeCount: overview.fda.activeApplications,
          descriptionKey: "admin.home.menu.fda.description",
          href: "/admin/fda",
          icon: BoltIcon,
          labelKey: "admin.home.menu.fda",
          live: false,
        },
      ],
    },
    {
      descriptionKey: "admin.home.group.market.description",
      labelKey: "admin.home.group.market",
      items: [
        {
          badgeCount: overview.content.products,
          descriptionKey: "admin.home.menu.products.description",
          href: "/admin/products",
          icon: BoxIcon,
          labelKey: "admin.home.menu.products",
          live: false,
        },
        {
          badgeCount: overview.content.buySellPosts + overview.content.buyRequests,
          descriptionKey: "admin.home.menu.buySell.description",
          href: "/admin/buy-sell",
          icon: HandshakeIcon,
          labelKey: "admin.home.menu.buySell",
          live: false,
        },
        {
          badgeCount: overview.content.industrialPosts + overview.content.epcPosts,
          descriptionKey: "admin.home.menu.projects.description",
          href: "/admin/projects",
          icon: GridIcon,
          labelKey: "admin.home.menu.projects",
          live: false,
        },
        {
          descriptionKey: "admin.home.menu.events.description",
          href: "/admin/events",
          icon: PulseIcon,
          labelKey: "admin.home.menu.events",
          live: false,
        },
      ],
    },
    {
      descriptionKey: "admin.home.group.network.description",
      labelKey: "admin.home.group.network",
      items: [
        {
          descriptionKey: "admin.home.menu.messages.description",
          href: "/admin/messages",
          icon: MailIcon,
          labelKey: "admin.home.menu.messages",
          live: false,
        },
        {
          badgeCount: overview.rewards.pending,
          descriptionKey: "admin.home.menu.rewards.description",
          href: "/admin/rewards",
          icon: BadgeIcon,
          labelKey: "admin.home.menu.rewards",
          live: false,
        },
        {
          descriptionKey: "admin.home.menu.referrals.description",
          href: "/admin/referrals",
          icon: HandshakeIcon,
          labelKey: "admin.home.menu.referrals",
          live: false,
        },
        {
          descriptionKey: "admin.home.menu.network.description",
          href: "/admin/network",
          icon: UsersIcon,
          labelKey: "admin.home.menu.network",
          live: false,
        },
      ],
    },
    {
      descriptionKey: "admin.home.group.settings.description",
      labelKey: "admin.home.group.settings",
      items: [
        {
          badgeCount: overview.platform.menus,
          descriptionKey: "admin.home.menu.master.description",
          href: "/admin/settings",
          icon: DatabaseIcon,
          labelKey: "admin.home.menu.master",
          live: false,
        },
        {
          badgeCount: overview.platform.translations,
          descriptionKey: "admin.home.menu.translations.description",
          href: "/admin/translations",
          icon: GlobeIcon,
          labelKey: "admin.home.menu.translations",
          live: false,
        },
        {
          badgeCount: overview.alerts.criticalAuditEvents,
          descriptionKey: "admin.home.menu.audit.description",
          href: "/admin/audit",
          icon: ShieldCheckIcon,
          labelKey: "admin.home.menu.audit",
          live: false,
          tone: overview.alerts.criticalAuditEvents > 0 ? "negative" : "positive",
        },
        {
          badgeCount: overview.platform.banners,
          descriptionKey: "admin.home.menu.landing.description",
          href: "/admin/landing",
          icon: GlobeIcon,
          labelKey: "admin.home.menu.landing",
          live: false,
        },
      ],
    },
  ];

  return (
    <main className="admin-page-frame">
      <section className="overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.20),transparent_32%),linear-gradient(135deg,var(--action-blue)_0%,#0a5fbd_100%)] text-white shadow-[0_18px_56px_rgb(11_99_206/0.18)]">
        <div className="grid items-center gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:p-6">
          <div className="min-w-0">
            <Badge dot={false} tone="info">
              {t("admin.home.eyebrow", "ko")}
            </Badge>
            <h1 className="mt-3 max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[38px]">
              {t("admin.home.title", "ko")}
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/68">
              {t("admin.home.description", "ko")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link className="public-header-primary-btn" href="/admin/members">
                {t("admin.home.primaryAction", "ko")}
              </Link>
              <Link className="public-header-ghost-btn" href="/admin/landing">
                {t("admin.home.secondaryAction", "ko")}
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SignalCard
              labelKey="admin.home.metric.memberPending"
              size="compact"
              tone={metricTone(overview.members.pendingApproval)}
              value={overview.members.pendingApproval}
            />
            <SignalCard
              labelKey="admin.home.metric.contentPending"
              size="compact"
              tone={metricTone(overview.content.totalPending)}
              value={overview.content.totalPending}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <LandingControlPanel overview={overview} />
        <WorkQueue overview={overview} />
      </section>

      <section className="mt-6">
        <SignupPolicyPanel overview={overview} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          labelKey="admin.home.metric.fdaActive"
          surface="light"
          tone={metricTone(overview.fda.activeApplications)}
          value={overview.fda.activeApplications}
        />
        <SignalCard
          labelKey="admin.home.metric.alerts"
          surface="light"
          tone={overview.alerts.criticalAuditEvents > 0 ? "negative" : "positive"}
          value={overview.alerts.criticalAuditEvents}
        />
        <SignalCard
          labelKey="admin.home.metric.translations"
          surface="light"
          tone="info"
          value={overview.platform.translations}
        />
        <SignalCard
          labelKey="admin.home.metric.banners"
          surface="light"
          tone="info"
          value={overview.platform.banners}
        />
      </section>

      <div className="mt-10 grid gap-10">
        {controlGroups.map((group) => (
          <ControlGroup group={group} key={group.labelKey} />
        ))}
      </div>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-[28px] border border-calm-hairline bg-white p-5 shadow-[0_24px_80px_rgb(15_23_42/0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-action-blue">
                {t("admin.home.systemMap.eyebrow", "ko")}
              </p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-calm-ink">
                {t("admin.home.systemMap.title", "ko")}
              </h2>
            </div>
            <Badge dot={false} tone="info">
              {t("admin.home.systemMap.badge", "ko")}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["admin.home.systemMap.member", "admin.home.systemMap.memberMeta"],
              ["admin.home.systemMap.content", "admin.home.systemMap.contentMeta"],
              ["admin.home.systemMap.operation", "admin.home.systemMap.operationMeta"],
            ].map(([labelKey, metaKey]) => (
              <article className="rounded-2xl border border-calm-hairline bg-canvas-parchment p-4" key={labelKey}>
                <p className="text-[14px] font-semibold text-calm-ink">{t(labelKey, "ko")}</p>
                <p className="mt-2 text-[12px] leading-5 text-calm-ink-muted-48">{t(metaKey, "ko")}</p>
              </article>
            ))}
          </div>
        </section>
        <RecentPanel overview={overview} />
      </section>
    </main>
  );
}
