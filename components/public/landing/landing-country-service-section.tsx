import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/public/icons";

type GatewayVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type CountryGatewayItem = {
  id: string;
  countryName: string;
  marketLabel: string;
  description: string;
  statusLabel: string;
  href: string;
  ctaLabel: string;
  isEnabled?: boolean;
};

export type ServiceGatewayItem = {
  id: string;
  serviceName: string;
  description: string;
  statusLabel: string;
  href: string;
  ctaLabel: string;
  isEnabled?: boolean;
};

export type LandingCountryServiceConfig = {
  sectionId: string;
  visibility: GatewayVisibility;
  publishState: "draft" | "scheduled" | "published" | "hidden" | "archived";
  eyebrow: string;
  title: string;
  subtitle: string;
  countryGatewayTitle: string;
  countryGatewaySubtitle: string;
  serviceGatewayTitle: string;
  serviceGatewaySubtitle: string;
  countryGateways: CountryGatewayItem[];
  serviceGateways: ServiceGatewayItem[];
};

function GatewayCta({
  href,
  isEnabled,
  label,
}: Readonly<{
  href: string;
  isEnabled?: boolean;
  label: string;
}>) {
  if (isEnabled === false) {
    return (
      <button className="landing-country-service-card-cta" disabled type="button">
        {label}
      </button>
    );
  }

  return (
    <Link className="landing-country-service-card-cta" href={href}>
      {label}
      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function LandingCountryServiceSection({
  config,
}: Readonly<{
  config: LandingCountryServiceConfig;
}>) {
  if (!config.visibility.isVisible || config.publishState !== "published") {
    return null;
  }

  return (
    <section
      aria-labelledby={`${config.sectionId}-title`}
      className="landing-country-service-section"
      id={config.sectionId}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="landing-country-service-header">
          <p className="landing-section-kicker">{config.eyebrow}</p>
          <h2 className="landing-section-title" id={`${config.sectionId}-title`}>
            {config.title}
          </h2>
          <p className="landing-section-lead">{config.subtitle}</p>
        </div>

        <div className="landing-country-service-layout">
          <div className="landing-country-service-block">
            <div className="landing-country-service-block-head">
              <span>{config.countryGatewayTitle}</span>
              <p>{config.countryGatewaySubtitle}</p>
            </div>

            <div className="landing-country-service-country-grid">
              {config.countryGateways.map((country) => (
                <article className="landing-country-service-card" key={country.id}>
                  <div className="landing-country-service-card-top">
                    <span className="landing-country-service-status">
                      <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                      {country.statusLabel}
                    </span>
                    <strong>{country.countryName}</strong>
                    <small>{country.marketLabel}</small>
                  </div>
                  <p>{country.description}</p>
                  <GatewayCta href={country.href} isEnabled={country.isEnabled} label={country.ctaLabel} />
                </article>
              ))}
            </div>
          </div>

          <div className="landing-country-service-block landing-country-service-block-accent">
            <div className="landing-country-service-block-head">
              <span>{config.serviceGatewayTitle}</span>
              <p>{config.serviceGatewaySubtitle}</p>
            </div>

            <div className="landing-country-service-service-grid">
              {config.serviceGateways.map((service) => (
                <article className="landing-country-service-card landing-country-service-card-service" key={service.id}>
                  <div className="landing-country-service-card-top">
                    <span className="landing-country-service-status">
                      <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                      {service.statusLabel}
                    </span>
                    <strong>{service.serviceName}</strong>
                  </div>
                  <p>{service.description}</p>
                  <GatewayCta href={service.href} isEnabled={service.isEnabled} label={service.ctaLabel} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
