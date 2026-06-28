export const publicNavigation = [
  { href: "/commercial", labelKey: "nav.commercial" },
  { href: "/industrial", labelKey: "nav.industrial" },
  { href: "/epc", labelKey: "nav.epc" },
  { href: "/events", labelKey: "nav.events" },
  { href: "/buy-sell", labelKey: "nav.buySell" },
  { href: "/networking", labelKey: "nav.networking" },
  { href: "/service", labelKey: "nav.thailandFda" },
  { href: "/notice", labelKey: "nav.notice" },
] as const;

export const dashboardNavigation = [
  { href: "/dashboard", labelKey: "dashboard.nav.overview" },
  { href: "/dashboard/company", labelKey: "dashboard.nav.company" },
  { href: "/dashboard/products", labelKey: "dashboard.nav.products" },
  { href: "/dashboard/referrals", labelKey: "dashboard.nav.referrals" },
  { href: "/dashboard/messages", labelKey: "dashboard.nav.messages" },
  { href: "/dashboard/activities", labelKey: "dashboard.nav.activities" },
  { href: "/dashboard/account", labelKey: "dashboard.nav.account" },
] as const;

export const adminNavigation = [
  { href: "/admin/members", labelKey: "admin.nav.members", subLabelKey: "admin.nav.members.en" },
  { href: "/admin/companies", labelKey: "admin.nav.companies", subLabelKey: "admin.nav.companies.en" },
  { href: "/admin/content", labelKey: "admin.nav.content", subLabelKey: "admin.nav.content.en" },
  { href: "/admin/landing", labelKey: "admin.nav.landing", subLabelKey: "admin.nav.landing.en" },
  { href: "/admin/products", labelKey: "admin.nav.products", subLabelKey: "admin.nav.products.en" },
  { href: "/admin/buy-sell", labelKey: "admin.nav.buySell", subLabelKey: "admin.nav.buySell.en" },
  { href: "/admin/projects", labelKey: "admin.nav.projects", subLabelKey: "admin.nav.projects.en" },
  { href: "/admin/events", labelKey: "admin.nav.events", subLabelKey: "admin.nav.events.en" },
  { href: "/admin/fda", labelKey: "admin.nav.fda", subLabelKey: "admin.nav.fda.en" },
  { href: "/admin/network", labelKey: "admin.nav.network", subLabelKey: "admin.nav.network.en" },
  { href: "/admin/messages", labelKey: "admin.nav.messages", subLabelKey: "admin.nav.messages.en" },
  { href: "/admin/settings", labelKey: "admin.nav.settings", subLabelKey: "admin.nav.settings.en" },
  { href: "/admin/audit", labelKey: "admin.nav.audit", subLabelKey: "admin.nav.audit.en" },
] as const;

export const protectedRoutePrefixes = ["/dashboard", "/admin"] as const;
export const adminRoutePrefix = "/admin";
export const pendingApprovalPath = "/pending-approval";
export const selectMemberTypePath = "/select-member-type";
export const signInPath = "/login";
