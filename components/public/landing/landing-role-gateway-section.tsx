import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/public/icons";

type RoleGatewayVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type RoleGatewayItem = {
  roleKey: "supplier" | "buyer" | "agent" | "professor" | "student";
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryText: string;
  statusLabel: string;
};

export type LandingRoleGatewayConfig = {
  sectionId: string;
  visibility: RoleGatewayVisibility;
  publishState: "draft" | "scheduled" | "published" | "hidden" | "archived";
  title: string;
  subtitle: string;
  roles: RoleGatewayItem[];
};

export function LandingRoleGatewaySection({
  config,
}: Readonly<{
  config: LandingRoleGatewayConfig;
}>) {
  if (!config.visibility.isVisible || config.publishState !== "published") {
    return null;
  }

  return (
    <section
      aria-labelledby={`${config.sectionId}-title`}
      className="landing-role-gateway-section"
      id={config.sectionId}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="landing-role-gateway-header">
          <p className="landing-section-kicker">Role Gateway</p>
          <h2 className="landing-section-title" id={`${config.sectionId}-title`}>
            {config.title}
          </h2>
          <p className="landing-section-lead">{config.subtitle}</p>
        </div>

        <div className="landing-role-gateway-grid">
          {config.roles.map((role) => (
            <article className="landing-role-gateway-card" data-role={role.roleKey} key={role.roleKey}>
              <div className="landing-role-gateway-card-top">
                <span className="landing-role-gateway-role">{role.title}</span>
                <span className="landing-role-gateway-status">
                  <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                  {role.statusLabel}
                </span>
              </div>

              <p className="landing-role-gateway-description">{role.description}</p>
              <p className="landing-role-gateway-secondary">{role.secondaryText}</p>

              <Link className="landing-role-gateway-cta" href={role.primaryCtaHref}>
                {role.primaryCtaLabel}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
