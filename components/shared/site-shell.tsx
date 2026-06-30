"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, SVGProps } from "react";
import { signOut } from "@/lib/actions/auth";
import { ActionFeedbackProvider } from "@/components/shared/action-feedback";
import { Badge, StatusBadge } from "@/components/shared/badge";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  BoxIcon,
  BuildingIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  DatabaseIcon,
  ExchangeIcon,
  GearIcon,
  GridIcon,
  LayoutPanelIcon,
  MenuIcon,
  NetworkNodesIcon,
  ProjectBoardIcon,
  PulseIcon,
  ServiceDeskIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/components/shared/icons";
import {
  DocumentCheckIcon,
  MailIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import {
  adminNavigation,
  dashboardNavigation,
  publicNavigation,
} from "@/lib/constants/routes";
import { t } from "@/lib/i18n/translation";
import type { DashboardRouteContext } from "@/lib/auth/guards";
import type { PublicHeaderUserContext } from "@/lib/auth/session";
import type { Locale } from "@/types/i18n";

type ShellVariant = "public" | "dashboard" | "admin";

type NavIcon = (props: Readonly<SVGProps<SVGSVGElement>>) => ReactNode;

const dashboardIconByHref: Record<string, NavIcon> = {
  "/dashboard": GridIcon,
  "/dashboard/account": UserCircleIcon,
  "/dashboard/activities": PulseIcon,
  "/dashboard/company": BuildingIcon,
  "/dashboard/messages": MailIcon,
  "/dashboard/products": BoxIcon,
  "/dashboard/referrals": NetworkNodesIcon,
};

const adminIconByHref: Record<string, NavIcon> = {
  "/admin": GridIcon,
  "/admin/audit": ShieldCheckIcon,
  "/admin/buy-sell": ExchangeIcon,
  "/admin/companies": BriefcaseIcon,
  "/admin/content": DocumentCheckIcon,
  "/admin/events": CalendarDaysIcon,
  "/admin/fda": ServiceDeskIcon,
  "/admin/landing": LayoutPanelIcon,
  "/admin/master-data": DatabaseIcon,
  "/admin/members": UsersIcon,
  "/admin/messages": MailIcon,
  "/admin/network": NetworkNodesIcon,
  "/admin/products": BoxIcon,
  "/admin/projects": ProjectBoardIcon,
  "/admin/settings": GearIcon,
  "/admin/translations": BuildingIcon,
};

const shellConfig: Record<
  ShellVariant,
  {
    iconByHref: Record<string, NavIcon>;
    locale: Locale;
    navigation: readonly { href: string; labelKey: string; subLabelKey?: string }[];
    titleKey: string;
  }
> = {
  admin: {
    iconByHref: adminIconByHref,
    locale: "ko",
    navigation: adminNavigation,
    titleKey: "admin.shellTitle",
  },
  dashboard: {
    iconByHref: dashboardIconByHref,
    locale: "en",
    navigation: dashboardNavigation,
    titleKey: "dashboard.title",
  },
  public: {
    iconByHref: {},
    locale: "en",
    navigation: publicNavigation,
    titleKey: "brand.name",
  },
};

const marketplacePublicNavigation = [
  { href: "/commercial", label: "Commercial", meta: "Catalog" },
  { href: "/industrial", label: "Industrial", meta: "Machinery" },
  { href: "/epc", label: "EPC", meta: "Projects" },
  { href: "/events", label: "Event", meta: "Programs" },
  { href: "/buy-sell", label: "BUY & SELL", meta: "RFQ" },
  { href: "/networking", label: "Networking", meta: "Partners" },
  { href: "/service", label: "Service", meta: "FDA" },
] as const;

const profileMenuByRole = {
  administrator: [
    { href: "/admin", labelKey: "nav.profile.admin.console", metaKey: "nav.profile.admin.consoleMeta" },
    { href: "/admin/members", labelKey: "nav.profile.admin.members", metaKey: "nav.profile.admin.membersMeta" },
    { href: "/admin/role-applications", labelKey: "nav.profile.admin.roleApplications", metaKey: "nav.profile.admin.roleApplicationsMeta" },
    { href: "/admin/companies", labelKey: "nav.profile.admin.companies", metaKey: "nav.profile.admin.companiesMeta" },
    { href: "/admin/content", labelKey: "nav.profile.admin.content", metaKey: "nav.profile.admin.contentMeta" },
  ],
  agent: [
    { href: "/dashboard", labelKey: "nav.profile.dashboard", metaKey: "nav.profile.dashboardMeta" },
    { href: "/dashboard/referrals", labelKey: "nav.profile.referrals", metaKey: "nav.profile.referrals.agentMeta" },
    { href: "/dashboard/activities", labelKey: "nav.profile.agent.activity", metaKey: "nav.profile.agent.activityMeta" },
    { href: "/dashboard/messages", labelKey: "nav.profile.messages", metaKey: "nav.profile.messagesMeta" },
    { href: "/dashboard/account", labelKey: "nav.profile.personal", metaKey: "nav.profile.personalMeta" },
  ],
  buyer: [
    { href: "/dashboard", labelKey: "nav.profile.dashboard", metaKey: "nav.profile.dashboardMeta" },
    { href: "/buy-sell/buy-requests", labelKey: "nav.profile.buyer.requests", metaKey: "nav.profile.buyer.requestsMeta" },
    { href: "/dashboard/referrals", labelKey: "nav.profile.referrals", metaKey: "nav.profile.referrals.buyerMeta" },
    { href: "/dashboard/messages", labelKey: "nav.profile.messages", metaKey: "nav.profile.messagesMeta" },
    { href: "/dashboard/account", labelKey: "nav.profile.personal", metaKey: "nav.profile.personalMeta" },
  ],
  professor: [
    { href: "/dashboard", labelKey: "nav.profile.dashboard", metaKey: "nav.profile.dashboardMeta" },
    { href: "/dashboard/referrals", labelKey: "nav.profile.referrals", metaKey: "nav.profile.referrals.professorMeta" },
    { href: "/dashboard/activities", labelKey: "nav.profile.professor.activity", metaKey: "nav.profile.professor.activityMeta" },
    { href: "/dashboard/messages", labelKey: "nav.profile.messages", metaKey: "nav.profile.messagesMeta" },
    { href: "/dashboard/account", labelKey: "nav.profile.personal", metaKey: "nav.profile.personalMeta" },
  ],
  student: [
    { href: "/dashboard", labelKey: "nav.profile.dashboard", metaKey: "nav.profile.dashboardMeta" },
    { href: "/dashboard/referrals", labelKey: "nav.profile.referrals", metaKey: "nav.profile.referrals.studentMeta" },
    { href: "/dashboard/activities", labelKey: "nav.profile.student.activity", metaKey: "nav.profile.student.activityMeta" },
    { href: "/commercial", labelKey: "nav.profile.student.discovery", metaKey: "nav.profile.student.discoveryMeta" },
    { href: "/dashboard/account", labelKey: "nav.profile.personal", metaKey: "nav.profile.personalMeta" },
  ],
  supplier: [
    { href: "/dashboard", labelKey: "nav.profile.dashboard", metaKey: "nav.profile.dashboardMeta" },
    { href: "/dashboard/company", labelKey: "nav.profile.supplier.company", metaKey: "nav.profile.supplier.companyMeta" },
    { href: "/dashboard/products", labelKey: "nav.profile.supplier.products", metaKey: "nav.profile.supplier.productsMeta" },
    { href: "/dashboard/account", labelKey: "nav.profile.personal", metaKey: "nav.profile.personalMeta" },
  ],
} satisfies Record<
  NonNullable<PublicHeaderUserContext["memberTypeCode"]>,
  readonly { href: string; labelKey: string; metaKey: string }[]
>;

const adminNotificationItems = [
  {
    bodyKey: "admin.notifications.fda.body",
    count: 2,
    href: "/admin/fda",
    titleKey: "admin.notifications.fda.title",
  },
  {
    bodyKey: "admin.notifications.content.body",
    count: 0,
    href: "/admin/content",
    titleKey: "admin.notifications.content.title",
  },
  {
    bodyKey: "admin.notifications.companies.body",
    count: 0,
    href: "/admin/companies",
    titleKey: "admin.notifications.companies.title",
  },
] as const;

const adminProfileMenuItems = [
  {
    href: "/admin",
    labelKey: "admin.profile.menu.console",
    metaKey: "admin.profile.menu.consoleMeta",
  },
  {
    href: "/admin/settings",
    labelKey: "admin.profile.menu.profile",
    metaKey: "admin.profile.menu.profileMeta",
  },
  {
    href: "/admin/content",
    labelKey: "admin.profile.menu.approvals",
    metaKey: "admin.profile.menu.approvalsMeta",
  },
  {
    href: "/admin/audit",
    labelKey: "admin.profile.menu.audit",
    metaKey: "admin.profile.menu.auditMeta",
  },
] as const;

function BellIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M15.2 17.25a3.2 3.2 0 0 1-6.4 0m10.1-2.55-1.36-1.76a3.55 3.55 0 0 1-.74-2.18V8.9a4.8 4.8 0 0 0-9.6 0v1.86c0 .79-.26 1.56-.74 2.18L5.1 14.7c-.58.75-.04 1.84.91 1.84h11.98c.95 0 1.49-1.09.91-1.84Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GuestAccessMenu() {
  return (
    <div className="flex shrink-0 items-center">
      <Link className="marketplace-login-button" href="/login">
        {t("nav.signIn")}
      </Link>
    </div>
  );
}

function HeaderNotifications({
  notifications,
  unreadCount,
}: Readonly<{
  notifications: PublicHeaderUserContext["notifications"];
  unreadCount: number;
}>) {
  const badgeLabel = unreadCount > 0 ? `${unreadCount} new` : t("nav.notifications.clear");
  const visibleCount = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="group/notice relative hidden sm:block">
      <button
        aria-label={t("nav.notifications.title")}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.07] text-white/[0.78] transition hover:border-white/[0.24] hover:bg-white/[0.12] hover:text-white"
        type="button"
      >
        <BellIcon className="h-[19px] w-[19px]" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-action-blue px-1 text-[10px] font-bold text-white shadow-[0_0_0_3px_#080a0f]">
            {visibleCount}
          </span>
        ) : null}
      </button>
      <div className="absolute right-0 top-full hidden w-[344px] pt-4 group-hover/notice:block group-focus-within/notice:block">
        <div className="rounded-[26px] border border-white/[0.12] bg-[#0c111a]/[0.96] p-4 text-white shadow-[0_24px_70px_rgb(0_0_0/0.42)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">{t("nav.notifications.title")}</p>
            <Badge dot={false} tone="info">
              {badgeLabel}
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3" key={`${item.createdAt}-${item.title}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[12px] font-semibold text-white">{item.title}</p>
                    <span className="shrink-0 rounded-full bg-action-blue/[0.18] px-2 py-0.5 text-[10px] font-bold capitalize text-action-blue">
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/50">
                    {item.body ?? item.type}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                <p className="text-[12px] font-semibold text-white">{t("nav.notifications.emptyTitle")}</p>
                <p className="mt-1 text-[11px] leading-4 text-white/50">{t("nav.notifications.emptyBody")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const totalCount = adminNotificationItems.reduce((total, item) => total + item.count, 0);
  const visibleCount = totalCount > 9 ? "9+" : String(totalCount);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsOpen(false);
        }
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-label={t("admin.notifications.title", "ko")}
        aria-expanded={isOpen}
        className="admin-notification-trigger"
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        type="button"
      >
        <BellIcon className="h-5 w-5" />
        <span className="admin-notification-badge">{visibleCount}</span>
      </button>
      <div className={`admin-notification-popover ${isOpen ? "admin-notification-popover-open" : ""}`}>
        <div className="admin-notification-panel">
          <div className="flex items-start justify-between gap-4 border-b border-[#dbe7f7] pb-3">
            <div>
              <p className="text-[13px] font-semibold text-calm-ink">
                {t("admin.notifications.title", "ko")}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-calm-ink-muted-60">
                {t("admin.notifications.description", "ko")}
              </p>
            </div>
            <span className="admin-notification-total">{visibleCount}</span>
          </div>
          <div className="mt-3 space-y-2">
            {adminNotificationItems.map((item) => (
              <Link
                className="admin-notification-item"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span className="admin-notification-item-count">{item.count}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-calm-ink">
                    {t(item.titleKey, "ko")}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-calm-ink-muted-60">
                    {t(item.bodyKey, "ko")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminProfileMenu({
  adminEmail,
}: Readonly<{
  adminEmail?: string | null;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  if (!adminEmail) {
    return null;
  }

  const displayName = adminEmail.split("@")[0] || adminEmail;
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div
      className="admin-profile-menu admin-profile-menu-topbar"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsOpen(false);
        }
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-expanded={isOpen}
        className="admin-profile-trigger"
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        type="button"
      >
        <span className="admin-profile-avatar">{initial}</span>
        <span className="admin-profile-copy">
          <span className="admin-profile-name">{displayName}</span>
          <span className="admin-profile-role">{t("admin.profile.role", "ko")}</span>
        </span>
        <span className="admin-profile-role-badge">{t("admin.profile.badge", "ko")}</span>
      </button>
      <div className={`admin-profile-popover ${isOpen ? "admin-profile-popover-open" : ""}`}>
        <div className="admin-profile-panel">
          <div className="flex items-start gap-3 border-b border-[#dbe7f7] pb-3">
            <span className="admin-profile-panel-avatar">{initial}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-calm-ink">
                {displayName}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-calm-ink-muted-60">
                {adminEmail}
              </span>
              <span className="mt-2 inline-flex rounded-full bg-[rgb(11_99_206/0.09)] px-2.5 py-1 text-[10px] font-bold text-[var(--action-blue)]">
                {t("admin.profile.role", "ko")}
              </span>
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {adminProfileMenuItems.map((item) => (
              <Link
                className="admin-profile-menu-link"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span>
                  <span className="block text-[12px] font-semibold text-calm-ink">
                    {t(item.labelKey, "ko")}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-calm-ink-muted-60">
                    {t(item.metaKey, "ko")}
                  </span>
                </span>
                <span className="text-[15px] text-[var(--action-blue)]">→</span>
              </Link>
            ))}
          </div>
          <form action={signOut} className="mt-3 border-t border-[#dbe7f7] pt-3">
            <button className="admin-profile-signout" type="submit">
              {t("nav.signOut", "ko")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function UserProfileMenu({
  publicUser,
}: Readonly<{
  publicUser: PublicHeaderUserContext;
}>) {
  const displayName = publicUser.displayName ?? publicUser.email;
  const roleLabel = publicUser.memberTypeCode ?? publicUser.approvalStatus ?? "member";
  const menuItems = publicUser.memberTypeCode
    ? profileMenuByRole[publicUser.memberTypeCode]
    : [{ href: publicUser.href, labelKey: "nav.profile.selectType", metaKey: "nav.profile.selectTypeMeta" }];

  return (
    <div className="group/profile relative">
      <Link
        className="flex min-h-[46px] min-w-0 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] py-1.5 pl-1.5 pr-3 text-white transition hover:border-white/[0.30] hover:bg-white/[0.12]"
        href={publicUser.href}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-calm-ink">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[128px] truncate text-[13px] font-semibold leading-tight">
            {displayName}
          </span>
          <span className="block truncate text-[11px] capitalize leading-tight text-white/[0.55]">
            {roleLabel.replaceAll("_", " ")}
          </span>
        </span>
      </Link>
      <div className="absolute right-0 top-full hidden w-[352px] pt-4 group-hover/profile:block group-focus-within/profile:block">
        <div className="rounded-[26px] border border-white/[0.12] bg-[#0c111a]/[0.96] p-4 text-white shadow-[0_24px_70px_rgb(0_0_0/0.42)] backdrop-blur-2xl">
          <div className="flex items-start gap-3 border-b border-white/[0.10] pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-bold text-calm-ink">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">{displayName}</span>
              <span className="mt-0.5 block truncate text-[12px] text-white/[0.48]">{publicUser.email}</span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                <Badge dot={false} tone="info">
                  {roleLabel.replaceAll("_", " ")}
                </Badge>
                <StatusBadge value={publicUser.approvalStatus} />
              </span>
            </span>
          </div>
          <div className="mt-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                className="group/item flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-white/[0.08]"
                href={item.href}
                key={item.labelKey}
              >
                <span>
                  <span className="block text-[13px] font-semibold text-white">{t(item.labelKey)}</span>
                  <span className="mt-0.5 block text-[11px] text-white/[0.48]">{t(item.metaKey)}</span>
                </span>
                <span className="text-white/[0.30] transition group-hover/item:translate-x-0.5 group-hover/item:text-action-blue">
                  →
                </span>
              </Link>
            ))}
          </div>
          <form action={signOut} className="mt-3 border-t border-white/[0.10] pt-3">
            <button className="public-header-ghost-btn w-full" type="submit">
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PublicAuthControls({
  publicUser,
}: Readonly<{
  publicUser?: PublicHeaderUserContext | null;
}>) {
  if (!publicUser) {
    return <GuestAccessMenu />;
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <HeaderNotifications notifications={publicUser.notifications} unreadCount={publicUser.unreadNotificationCount} />
      <UserProfileMenu publicUser={publicUser} />
    </div>
  );
}

function PublicSiteHeader({
  publicUser,
}: Readonly<{
  publicUser?: PublicHeaderUserContext | null;
}>) {
  const pathname = usePathname();

  return (
    <header className="marketplace-public-header">
      <div className="mx-auto flex min-h-[62px] max-w-[1320px] items-center gap-3 px-5 sm:px-8 lg:px-10">
        <Link aria-label={t("brand.name")} className="marketplace-header-logo" href="/">
          <BrandLogo />
        </Link>

        <nav className="marketplace-header-nav-shell hidden min-w-0 flex-1 items-center justify-center lg:flex">
          {marketplacePublicNavigation.map((item) => (
            <Link
              className={`marketplace-header-nav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "active" : ""}`}
              href={item.href}
              key={item.href}
            >
              <span className="marketplace-header-nav-label">{item.label}</span>
              <span className="marketplace-header-nav-meta">{item.meta}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0">
          <PublicAuthControls publicUser={publicUser} />
        </div>
      </div>
    </header>
  );
}

function DashboardProfileMenu({
  dashboardContext,
}: Readonly<{
  dashboardContext?: DashboardRouteContext;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && !menuRef.current?.contains(target)) {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!dashboardContext) {
    return null;
  }

  const clearScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const openMenu = () => {
    clearScheduledClose();
    setIsOpen(true);
  };
  const scheduleClose = () => {
    clearScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 220);
  };

  const displayName = dashboardContext.displayName ?? dashboardContext.email;
  const roleLabel = dashboardContext.memberTypeCode.replaceAll("_", " ");
  const menuItems = [
    {
      href: "/dashboard/account",
      labelKey: "nav.profile.personal",
      metaKey: "nav.profile.personalMeta",
    },
    {
      href: "/dashboard/referrals",
      labelKey: "nav.profile.referrals",
      metaKey: "nav.profile.referralsMeta",
    },
    {
      href: "/dashboard/messages",
      labelKey: "nav.profile.messages",
      metaKey: "nav.profile.messagesMeta",
    },
  ];

  return (
    <div
      className="dashboard-profile-menu"
      ref={menuRef}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          clearScheduledClose();
          setIsOpen(false);
        }
      }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        aria-expanded={isOpen}
        className="dashboard-profile-trigger"
        onClick={() => {
          clearScheduledClose();
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span className="dashboard-profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
        <span className="dashboard-profile-copy">
          <span className="dashboard-profile-name">{displayName}</span>
          <span className="dashboard-profile-role">{dashboardContext.careerRankName ?? roleLabel}</span>
        </span>
        <span className="dashboard-profile-badge">{roleLabel}</span>
      </button>
      <div
        className={`dashboard-profile-popover ${isOpen ? "dashboard-profile-popover-open" : ""}`}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div className="dashboard-profile-panel">
          <div className="flex items-start gap-3 border-b border-[#dbe7f7] pb-3">
            <span className="admin-profile-panel-avatar">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-calm-ink">
                {displayName}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-calm-ink-muted-60">
                {dashboardContext.email}
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                <Badge dot={false} tone="neutral">
                  {roleLabel}
                </Badge>
                <StatusBadge value={dashboardContext.activityStatus} />
              </span>
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {menuItems.map((item) => (
              <Link
                className="admin-profile-menu-link"
                href={item.href}
                key={item.href}
                onClick={() => {
                  clearScheduledClose();
                  setIsOpen(false);
                }}
              >
                <span>
                  <span className="block text-[12px] font-semibold text-calm-ink">
                    {t(item.labelKey)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-calm-ink-muted-60">
                    {t(item.metaKey)}
                  </span>
                </span>
                <span className="text-[15px] text-[var(--action-blue)]">→</span>
              </Link>
            ))}
          </div>
          <form action={signOut} className="mt-3 border-t border-[#dbe7f7] pt-3">
            <button className="admin-profile-signout" onClick={clearScheduledClose} type="submit">
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function SiteShell({
  adminEmail,
  children,
  dashboardContext,
  publicUser,
  variant,
}: Readonly<{
  adminEmail?: string | null;
  children: ReactNode;
  dashboardContext?: DashboardRouteContext;
  publicUser?: PublicHeaderUserContext | null;
  variant: ShellVariant;
}>) {
  const config = shellConfig[variant];
  const pathname = usePathname();

  if (variant === "public") {
    return (
      <div className="min-h-screen bg-white">
        <PublicSiteHeader publicUser={publicUser} />
        {children}
        <ActionFeedbackProvider />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${variant === "admin" ? "admin-console-surface bg-[#eef5ff] lg:flex" : "bg-canvas-parchment lg:flex"}`}>
      <aside
        className={`hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-shrink-0 lg:flex-col lg:border-r ${
          variant === "admin" ? "admin-sidebar-shell border-white/10 bg-[var(--action-blue)] text-white shadow-[18px_0_60px_rgb(11_99_206/0.18)]" : "dashboard-sidebar-shell border-calm-hairline bg-white"
        }`}
      >
        <Link
          className={`border-b type-tagline transition ${
            variant === "admin"
              ? "admin-sidebar-brand flex h-16 items-center gap-3 border-white/10 px-4 text-white hover:text-white"
              : "flex h-[64px] items-center border-calm-hairline px-6 text-calm-ink hover:text-action-blue"
          }`}
          href={variant === "admin" ? "/admin" : variant === "dashboard" ? "/dashboard" : "/"}
        >
          {variant === "admin" ? (
            <>
              <span className="admin-sidebar-logo-icon">
                <GridIcon className="h-[20px] w-[20px]" />
              </span>
              <span className="admin-sidebar-title-full min-w-0">
                <span className="block truncate text-[15px] font-bold tracking-[-0.01em]">
                  {t(config.titleKey, config.locale)}
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  B2BB2G Operator
                </span>
              </span>
            </>
          ) : (
            <span className="dashboard-sidebar-brand-text">Member</span>
          )}
        </Link>
        <nav className={`flex-1 space-y-1 overflow-y-auto ${variant === "admin" ? "px-3 py-4" : "px-3 py-4"}`}>
          {config.navigation.map((item) => {
            const Icon = config.iconByHref[item.href];
            const isActive = pathname === item.href;
            const label = t(item.labelKey, config.locale);
            const subLabel = item.subLabelKey ? t(item.subLabelKey, config.locale) : null;

            return (
              <Link
                className={
                  variant === "admin"
                    ? `admin-sidebar-nav-link group flex min-h-[48px] items-center gap-3 rounded-2xl px-3 text-[13px] transition ${
                        isActive
                          ? "text-white"
                          : "text-white/66 hover:text-white"
                      }`
                    : `shell-nav-link ${isActive ? "shell-nav-link-active" : ""}`
                }
                aria-current={isActive ? "page" : undefined}
                href={item.href}
                key={item.href}
                title={subLabel ? `${label} / ${subLabel}` : label}
              >
                {Icon ? (
                  <span className={variant === "admin" ? "admin-sidebar-icon-box" : "dashboard-sidebar-icon-box"}>
                    <Icon className="h-5 w-5 shrink-0" />
                  </span>
                ) : null}
                {variant === "admin" ? (
                  <span className="admin-sidebar-nav-label min-w-0">
                    <span className="block truncate text-[14px] font-semibold leading-snug">
                      {label}
                    </span>
                    {subLabel ? (
                      <span
                        className={`mt-0.5 block truncate border-t pt-0.5 text-[11px] font-medium leading-tight ${
                          isActive ? "border-white/16 text-white/52" : "border-white/10 text-white/36"
                        }`}
                      >
                        {subLabel}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="dashboard-sidebar-nav-label truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={`flex min-h-screen min-w-0 flex-1 flex-col ${variant === "admin" ? "admin-main-shell" : ""}`}>
        <header className={`${variant === "admin" ? "sticky top-0 z-30 border-b border-calm-hairline bg-white/88 backdrop-blur-xl" : "frosted-parchment sticky top-0 z-30 border-b border-calm-hairline"}`}>
          <div className={`flex h-16 items-center gap-4 px-5 sm:px-8 ${variant === "admin" || variant === "dashboard" ? "lg:flex" : "lg:hidden"}`}>
            {variant === "admin" ? null : (
              <MenuIcon className="h-5 w-5 shrink-0 text-calm-ink-muted-48 lg:hidden" />
            )}
            <Link className="type-tagline text-calm-ink lg:hidden" href={variant === "admin" ? "/admin" : "/"}>
              {t(config.titleKey, config.locale)}
            </Link>
            {variant === "admin" ? (
              <div className="admin-topbar hidden min-w-0 flex-1 items-center justify-between gap-5 lg:flex">
                <div className="admin-topbar-copy min-w-0">
                  <p className="admin-topbar-kicker">
                    B2BB2G Operations
                  </p>
                </div>
                <div className="admin-topbar-actions">
                  <AdminNotifications />
                  <AdminProfileMenu adminEmail={adminEmail} />
                  <span aria-hidden="true" className="admin-topbar-divider" />
                  <Link className="admin-topbar-action admin-topbar-action-secondary" href="/">
                    {t("admin.topbar.preview", "ko")}
                  </Link>
                  <Link className="admin-topbar-action admin-topbar-action-primary" href="/admin/content">
                    {t("admin.topbar.approvals", "ko")}
                  </Link>
                </div>
              </div>
            ) : null}
            {variant === "dashboard" ? (
              <div className="dashboard-topbar hidden min-w-0 flex-1 items-center justify-between gap-5 lg:flex">
                <div className="dashboard-topbar-copy min-w-0">
                  <p className="dashboard-topbar-kicker">B2BB2G Member Workspace</p>
                </div>
                <div className="dashboard-topbar-actions">
                  <Link className="admin-topbar-action admin-topbar-action-secondary" href="/">
                    {t("dashboard.topbar.publicSite")}
                  </Link>
                  <DashboardProfileMenu dashboardContext={dashboardContext} key={pathname} />
                </div>
              </div>
            ) : null}
          </div>
          <nav className={`flex gap-2 overflow-x-auto px-5 pb-3 sm:px-8 ${variant === "admin" ? "lg:hidden" : "lg:hidden"}`}>
            {config.navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  className={`calm-chip shrink-0 ${isActive ? "calm-chip-selected" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  {t(item.labelKey, config.locale)}
                </Link>
              );
            })}
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </div>
      <ActionFeedbackProvider />
    </div>
  );
}
