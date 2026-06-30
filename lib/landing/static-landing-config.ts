import type { LandingHeroConfig } from "@/components/public/landing/landing-hero-section";
import type { LandingMarketplaceConfig } from "@/components/public/landing/landing-marketplace-sections";
import type { LandingNoticeCtaFooterConfig } from "@/components/public/landing/landing-notice-cta-footer-section";
import type { MarketplaceHomeConfig } from "@/components/public/landing/marketplace-home";

const visiblePublishedState = {
  publishState: "published" as const,
  visibility: {
    endsAt: null,
    isVisible: true,
    startsAt: null,
  },
};

const industrialPumpImage =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80";
const generatorImage =
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80";
const solarImage =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80";
const cncImage =
  "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80";
const labImage =
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=80";
const logisticsImage =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80";
const cityEventImage =
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80";
const skylineImage =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80";
const agricultureImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";
const packagingImage =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80";
const roboticsImage =
  "https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?auto=format&fit=crop&w=900&q=80";
const electronicsImage =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80";
const warehouseImage =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80";

const hero: LandingHeroConfig = {
  ...visiblePublishedState,
  eyebrow: "Connect. Trade. Grow.",
  searchPlaceholder: "Explore approved products, suppliers, and RFQ programs",
  subtitle:
    "A trusted global marketplace connecting verified suppliers with protected buyer demand, events, and admin-reviewed trade opportunities.",
  title: "Your Global B2B Success Starts Here",
  trustItems: [
    { label: "Verified Suppliers" },
    { label: "Global Buyers" },
    { label: "Secure Trading" },
    { label: "24/7 Support" },
  ],
};

const marketplace: LandingMarketplaceConfig = {
  ...visiblePublishedState,
  activeProjects: {
    ...visiblePublishedState,
    items: [
      {
        category: "EPC",
        companyName: "Gulf Infrastructure Desk",
        href: "/epc",
        id: "active-project-water-treatment",
        imageAlt: "Water treatment infrastructure project",
        imageUrl: warehouseImage,
        title: "Water Treatment Plant Equipment",
      },
      {
        category: "Industrial",
        companyName: "Vietnam Factory Sourcing",
        href: "/industrial",
        id: "active-project-factory-upgrade",
        imageAlt: "Industrial factory upgrade project",
        imageUrl: logisticsImage,
        title: "Factory Automation Upgrade",
      },
      {
        category: "Service",
        companyName: "Thailand Compliance Desk",
        href: "/service",
        id: "active-project-fda-compliance",
        imageAlt: "Thailand FDA compliance project",
        imageUrl: labImage,
        title: "Thailand FDA Registration Support",
      },
    ],
    publishState: "published",
    sectionId: "active-projects",
    subtitle: "Structured project opportunities prepared for approved marketplace workflows.",
    title: "Active Projects",
    viewAll: {
      href: "/epc",
      isEnabled: false,
      label: "View all projects",
    },
  },
  advertisingBanner: {
    cta: {
      href: "/signup/supplier",
      label: "Advertise Now",
    },
    description:
      "Increase visibility, generate qualified leads, and grow your products globally with premium supplier placement.",
    imageAlt: "Blue megaphone advertising visual",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
    kicker: "Advertising",
    title: "Promote Your Products to Global Buyers",
  },
  announcements: {
    ...visiblePublishedState,
    items: [
      {
        dateLabel: "Jun 30",
        description: "Scheduled maintenance is planned for marketplace search and inquiry preview services.",
        href: "/notice",
        id: "announcement-maintenance",
        statusLabel: "System",
        title: "Platform System Maintenance Notice",
      },
      {
        dateLabel: "Jun 26",
        description: "Supplier registration for Thailand Industrial Expo sourcing sessions is now open.",
        href: "/notice",
        id: "announcement-thailand-expo",
        statusLabel: "Event",
        title: "Thailand Industrial Expo Registration Open",
      },
      {
        dateLabel: "Jun 21",
        description: "Verified suppliers can prepare premium exposure requests for the next marketplace cycle.",
        href: "/notice",
        id: "announcement-premium-supplier",
        statusLabel: "Supplier",
        title: "New Premium Supplier Program Launched",
      },
      {
        dateLabel: "Jun 18",
        description: "Buyer privacy and managed inquiry protection have been upgraded across public surfaces.",
        href: "/notice",
        id: "announcement-security",
        statusLabel: "Security",
        title: "Enhanced Security and Verification System",
      },
    ],
    publishState: "published",
    sectionId: "marketplace-announcements",
    title: "Announcements",
    viewAll: {
      href: "/notice",
      isEnabled: false,
      label: "View all announcements",
    },
  },
  faqs: {
    ...visiblePublishedState,
    items: [
      {
        answer:
          "Start with supplier registration. Admin approval is required before company setup, product publishing, and premium exposure are opened.",
        id: "faq-verified-supplier",
        question: "How can I become a verified supplier?",
      },
      {
        answer:
          "Product inquiry creation is planned for the managed RFQ flow. Buyer identity data is not exposed from the public landing page.",
        id: "faq-product-inquiry",
        question: "How do I submit a product inquiry?",
      },
      {
        answer:
          "Basic registration has no public fee display. Premium supplier benefits are reviewed and assigned after admin approval.",
        id: "faq-fee",
        question: "Is there a fee to join B2B2G?",
      },
      {
        answer:
          "Buyer requests are routed through admin-reviewed RFQ handling, so buyer identity and identity fields remain hidden from suppliers by default.",
        id: "faq-contact",
        question: "Can suppliers access buyer identity data?",
      },
      {
        answer:
          "Premium supplier placement can improve exposure in product banners, featured rows, and marketplace highlight zones.",
        id: "faq-premium",
        question: "How does the premium supplier program work?",
      },
    ],
    publishState: "published",
    sectionId: "marketplace-faq",
    title: "FAQ",
    viewAll: {
      href: "/faq",
      isEnabled: false,
      label: "View all FAQs",
    },
  },
  intelligencePanel: {
    ...visiblePublishedState,
    buyerRequests: {
      items: [
        {
          badge: "RFQ",
          id: "request-stainless-steel-sheet",
          quantity: "Quantity: 24 tons",
          spec: "Grade 304, thickness 2 mm",
          title: "Stainless Steel Sheet",
        },
        {
          badge: "RFQ",
          id: "request-hydraulic-cylinder",
          quantity: "Quantity: 300 units",
          spec: "Bore 100 mm, stroke 500 mm",
          title: "Hydraulic Cylinder",
        },
        {
          badge: "RFQ",
          id: "request-led-high-bay",
          quantity: "Quantity: 1,200 units",
          spec: "Industrial high bay lighting",
          title: "LED Lighting System",
        },
        {
          badge: "RFQ",
          id: "request-packaging-film-roll",
          quantity: "Quantity: 18 pallets",
          spec: "PET, width 500 mm",
          title: "Packaging Film Roll",
        },
      ],
      title: "Buyer Requests",
      viewAll: {
        href: "/buy-requests",
        isEnabled: false,
        label: "View all requests",
      },
    },
    eventHighlights: {
      items: [
        {
          badge: "Expo",
          dateLabel: "May 28",
          description: "Industrial sourcing and supplier showcase",
          href: "/events",
          id: "event-thailand-industrial-expo",
          imageAlt: "Thailand industrial event hall",
          imageUrl: cityEventImage,
          locationLabel: "Bangkok, Thailand",
          title: "Thailand Industrial Expo 2024",
        },
        {
          badge: "Mission",
          dateLabel: "Jun 15",
          description: "Korea supplier trade mission",
          href: "/events",
          id: "event-korea-trade-mission",
          imageAlt: "Korea trade event",
          imageUrl: skylineImage,
          locationLabel: "Seoul, Korea",
          title: "Korea Trade Mission",
        },
        {
          badge: "Summit",
          dateLabel: "Jun 22",
          description: "Global buyer sourcing forum",
          href: "/events",
          id: "event-procurement-summit",
          imageAlt: "Global procurement summit city",
          imageUrl: logisticsImage,
          locationLabel: "Singapore",
          title: "Global Procurement Summit",
        },
      ],
      title: "Event Highlights",
      viewAll: {
        href: "/events",
        isEnabled: false,
        label: "View all events",
      },
    },
    publishState: "published",
    sectionId: "marketplace-intelligence",
    upcomingEvents: {
      items: [
        {
          badge: "Fair",
          dateLabel: "Jul 10",
          description: "Industrial buyer matching fair",
          href: "/events",
          id: "upcoming-vietnam-industrial-fair",
          imageAlt: "Vietnam industrial fair",
          imageUrl: skylineImage,
          locationLabel: "Ho Chi Minh, Vietnam",
          title: "Vietnam Industrial Fair 2024",
        },
        {
          badge: "Conference",
          dateLabel: "Jul 25",
          description: "Regional supply chain conference",
          href: "/events",
          id: "upcoming-asia-supply-chain",
          imageAlt: "Asia supply chain conference",
          imageUrl: logisticsImage,
          locationLabel: "Kuala Lumpur, Malaysia",
          title: "Asia Supply Chain Conference",
        },
        {
          badge: "Expo",
          dateLabel: "Aug 06",
          description: "Automotive sourcing expo",
          href: "/events",
          id: "upcoming-auto-parts-expo",
          imageAlt: "Automotive parts expo",
          imageUrl: warehouseImage,
          locationLabel: "Tokyo, Japan",
          title: "Automotive Parts Expo",
        },
      ],
      title: "Upcoming Events",
      viewAll: {
        href: "/events",
        isEnabled: false,
        label: "View all events",
      },
    },
  },
  latestProducts: {
    ...visiblePublishedState,
    items: [
      {
        category: "Industrial",
        description: "High-pressure valve system for factory utility lines.",
        href: "/products",
        id: "latest-industrial-valve",
        imageAlt: "Industrial valve",
        imageUrl: industrialPumpImage,
        isVerifiedSupplier: false,
        supplierName: "ValveCore Systems",
        title: "Industrial Valve",
      },
      {
        category: "Machinery",
        description: "Efficient motor unit for industrial automation projects.",
        href: "/products",
        id: "latest-electric-motor",
        imageAlt: "Electric motor",
        imageUrl: generatorImage,
        isVerifiedSupplier: true,
        supplierName: "PowerDrive Systems",
        title: "Electric Motor",
      },
      {
        category: "Medical",
        description: "Digital monitor for clinical and industrial health environments.",
        href: "/products",
        id: "latest-medical-monitor",
        imageAlt: "Medical monitor",
        imageUrl: electronicsImage,
        isVerifiedSupplier: true,
        supplierName: "MedTech Global",
        title: "Medical Monitor",
      },
      {
        category: "Lighting",
        description: "Energy-saving LED high bay light for warehouse sites.",
        href: "/products",
        id: "latest-led-high-bay",
        imageAlt: "LED high bay light",
        imageUrl: warehouseImage,
        isVerifiedSupplier: false,
        supplierName: "BrightLite Lighting",
        title: "LED High Bay Light",
      },
      {
        category: "Packaging",
        description: "Packaging machine line for export-ready production.",
        href: "/products",
        id: "latest-packaging-machine",
        imageAlt: "Packaging machine",
        imageUrl: packagingImage,
        isVerifiedSupplier: true,
        supplierName: "PackTech Solutions",
        title: "Packaging Machine",
      },
      {
        category: "Industrial",
        description: "Air compressor package for plant operations.",
        href: "/products",
        id: "latest-air-compressor",
        imageAlt: "Air compressor",
        imageUrl: industrialPumpImage,
        isVerifiedSupplier: false,
        supplierName: "AirTech Systems",
        title: "Air Compressor",
      },
      {
        category: "Chemicals",
        description: "Chemical raw materials prepared for controlled sourcing.",
        href: "/products",
        id: "latest-chemical-raw-materials",
        imageAlt: "Chemical raw materials",
        imageUrl: labImage,
        isVerifiedSupplier: true,
        supplierName: "ChemSource Global",
        title: "Chemical Raw Materials",
      },
      {
        category: "Materials",
        description: "Steel pipe bundle for industrial and EPC projects.",
        href: "/products",
        id: "latest-steel-pipe",
        imageAlt: "Steel pipe",
        imageUrl: warehouseImage,
        isVerifiedSupplier: true,
        supplierName: "SteelPro Industries",
        title: "Steel Pipe",
      },
      {
        category: "Energy",
        description: "Solar inverter package for distributed energy projects.",
        href: "/products",
        id: "latest-solar-inverter",
        imageAlt: "Solar inverter",
        imageUrl: solarImage,
        isVerifiedSupplier: true,
        supplierName: "SunPower Energy",
        title: "Solar Inverter",
      },
      {
        category: "Industrial",
        description: "Industrial pump for water and chemical transfer lines.",
        href: "/products",
        id: "latest-industrial-pump",
        imageAlt: "Industrial pump",
        imageUrl: industrialPumpImage,
        isVerifiedSupplier: true,
        supplierName: "FlowTech Solutions",
        title: "Industrial Pump",
      },
    ],
    publishState: "published",
    sectionId: "marketplace-latest-products",
    subtitle: "Fresh marketplace listings prepared for managed inquiry flow.",
    title: "Latest Products",
    viewAll: {
      href: "/products",
      isEnabled: false,
      label: "View all products",
    },
  },
  premiumProducts: {
    ...visiblePublishedState,
    items: [
      {
        category: "Premium",
        description: "Heavy-duty pump for industrial water, cooling, and process utility lines.",
        href: "/products",
        id: "premium-industrial-pump",
        imageAlt: "Industrial pump product",
        imageUrl: industrialPumpImage,
        isVerifiedSupplier: true,
        supplierName: "FlowTech Solutions",
        title: "Industrial Pump",
      },
      {
        category: "Premium",
        description: "Generator set for facility backup power and industrial sites.",
        href: "/products",
        id: "premium-generator-set",
        imageAlt: "Generator set product",
        imageUrl: generatorImage,
        isVerifiedSupplier: true,
        supplierName: "PowerGen Systems",
        title: "Generator Set",
      },
      {
        category: "Premium",
        description: "Solar panel package for commercial and utility-scale projects.",
        href: "/products",
        id: "premium-solar-panel",
        imageAlt: "Solar panel product",
        imageUrl: solarImage,
        isVerifiedSupplier: true,
        supplierName: "SunPower Energy",
        title: "Solar Panel",
      },
      {
        category: "Premium",
        description: "Precision CNC machining capacity for export manufacturing.",
        href: "/products",
        id: "premium-cnc-machining",
        imageAlt: "CNC machining product",
        imageUrl: cncImage,
        isVerifiedSupplier: true,
        supplierName: "PrecisionMFG Co., Ltd.",
        title: "CNC Machining",
      },
      {
        category: "Premium",
        description: "Chemical raw materials for controlled sourcing and review.",
        href: "/products",
        id: "premium-chemical-raw-materials",
        imageAlt: "Chemical raw materials product",
        imageUrl: labImage,
        isVerifiedSupplier: true,
        supplierName: "ChemSource Global",
        title: "Chemical Raw Materials",
      },
    ],
    publishState: "published",
    sectionId: "premium-suppliers-products",
    subtitle: "Image-rich supplier placements for approved premium exposure.",
    title: "Premium Suppliers' Products",
    viewAll: {
      href: "/suppliers",
      isEnabled: false,
      label: "View all suppliers",
    },
  },
  productShowcase: {
    ...visiblePublishedState,
    items: [
      {
        category: "AgriTech",
        companyName: "AgriTech Innovations",
        href: "/networking",
        id: "showcase-smart-irrigation",
        imageAlt: "Smart irrigation system",
        imageUrl: agricultureImage,
        title: "Smart Irrigation System",
      },
      {
        category: "Sustainable Packaging",
        companyName: "GreenPack Solutions",
        href: "/networking",
        id: "showcase-eco-packaging",
        imageAlt: "Eco-friendly packaging project",
        imageUrl: packagingImage,
        title: "Eco-friendly Packaging",
      },
      {
        category: "Automation",
        companyName: "RoboTech Systems",
        href: "/networking",
        id: "showcase-ai-inspection-robot",
        imageAlt: "AI quality inspection robot",
        imageUrl: roboticsImage,
        title: "AI Quality Inspection Robot",
      },
    ],
    publishState: "published",
    sectionId: "product-showcase",
    subtitle: "Innovation and project cards prepared for global exposure.",
    title: "Product Showcase",
    viewAll: {
      href: "/networking",
      isEnabled: false,
      label: "View all showcases",
    },
  },
  publishState: "published",
  sectionId: "marketplace-landing-v2",
  supplierHighlight: {
    ...visiblePublishedState,
    banner: {
      cta: {
        href: "/signup/supplier",
        label: "Become a Premium Supplier",
      },
      description:
        "Stand out, get discovered, and win more business opportunities through premium placement, verified badge review, and global exposure.",
      kicker: "Premium Supplier Highlight",
      title: "Premium Suppliers Get More Exposure",
    },
    productImages: [
      { id: "highlight-pump", imageAlt: "Premium pump product", imageUrl: industrialPumpImage },
      { id: "highlight-lab", imageAlt: "Premium lab product", imageUrl: labImage },
      { id: "highlight-solar", imageAlt: "Premium solar product", imageUrl: solarImage },
      { id: "highlight-cnc", imageAlt: "Premium CNC product", imageUrl: cncImage },
    ],
    publishState: "published",
    sectionId: "premium-supplier-highlight",
  },
  topBanners: {
    ...visiblePublishedState,
    items: [
      {
        badge: "Premium Supplier",
        cta: { href: "/products", isEnabled: false, label: "View More" },
        description: "Industrial Power Solutions for a Stronger Tomorrow",
        id: "top-banner-industrial-power",
        imageAlt: "Industrial power solution product",
        imageUrl: industrialPumpImage,
        title: "Industrial Power Solutions",
        tone: "navy",
      },
      {
        badge: "Event",
        cta: { href: "/events", isEnabled: false, label: "Register Now" },
        description: "Singapore · June 22 - June 23, 2024",
        id: "top-banner-procurement-summit",
        imageAlt: "Global procurement summit skyline",
        imageUrl: skylineImage,
        title: "Global Procurement Summit 2024",
        tone: "blue",
      },
      {
        badge: "Service",
        cta: { href: "/service", isEnabled: false, label: "Learn More" },
        description: "Your trusted partner for FDA registration and compliance.",
        id: "top-banner-thailand-fda",
        imageAlt: "Thailand FDA laboratory flasks",
        imageUrl: labImage,
        title: "Thailand FDA Service",
        tone: "teal",
      },
    ],
    publishState: "published",
    sectionId: "marketplace-top-banners",
  },
  verifiedBuyers: {
    ...visiblePublishedState,
    items: [
      {
        avatarLabel: "B",
        companyName: "B******** Co., Ltd.",
        country: "Thailand",
        id: "buyer-thailand-procurement",
        role: "Procurement Manager",
      },
      {
        avatarLabel: "G",
        companyName: "G******** Inc.",
        country: "Singapore",
        id: "buyer-singapore-purchasing",
        role: "Purchasing Director",
      },
      {
        avatarLabel: "T",
        companyName: "T******** GmbH",
        country: "Germany",
        id: "buyer-germany-supply",
        role: "Supply Chain Lead",
      },
      {
        avatarLabel: "D",
        companyName: "D******** Corporation",
        country: "United States",
        id: "buyer-us-buyer",
        role: "Buyer",
      },
      {
        avatarLabel: "P",
        companyName: "P******** Pvt. Ltd.",
        country: "India",
        id: "buyer-india-purchase",
        role: "Purchase Head",
      },
    ],
    publishState: "published",
    sectionId: "verified-buyers",
    subtitle: "Masked buyer profiles protect identity and contact information.",
    title: "Verified Buyers",
    viewAll: {
      href: "/networking",
      isEnabled: false,
      label: "View all buyers",
    },
  },
};

const noticeCtaFooter: LandingNoticeCtaFooterConfig = {
  ...visiblePublishedState,
  brandLabel: "B2B2G",
  eventItems: [],
  eventTitle: "Events",
  eyebrow: "Global B2B marketplace",
  finalCta: {
    primaryCta: {
      href: "/signup/supplier",
      label: "Start Supplier Registration",
    },
    secondaryCta: {
      href: "/signup/buyer",
      label: "Join as Buyer",
    },
    signInCta: {
      href: "/login",
      label: "Login",
    },
    subtitle:
      "Build a verified supplier presence, explore protected buyer demand, and prepare your products for admin-reviewed global trade.",
    title: "Ready to enter the global B2B marketplace?",
  },
  footerGroups: [
    {
      groupTitle: "Marketplace",
      links: [
        { href: "/commercial", isEnabled: false, label: "Commercial" },
        { href: "/industrial", isEnabled: false, label: "Industrial" },
        { href: "/epc", isEnabled: false, label: "EPC" },
        { href: "/buy-sell", isEnabled: false, label: "BUY & SELL" },
      ],
    },
    {
      groupTitle: "Company",
      links: [
        { href: "/about", isEnabled: false, label: "About Us" },
        { href: "/events", isEnabled: false, label: "Events" },
        { href: "/notice", isEnabled: false, label: "Announcements" },
        { href: "/networking", isEnabled: false, label: "Networking" },
      ],
    },
    {
      groupTitle: "Resources",
      links: [
        { href: "/service", isEnabled: false, label: "Thailand FDA Service" },
        { href: "/faq", isEnabled: false, label: "FAQ" },
        { href: "/support", isEnabled: false, label: "Support" },
        { href: "/login", label: "Login" },
      ],
    },
    {
      groupTitle: "Roles",
      links: [
        { href: "/signup/supplier", label: "Supplier Signup" },
        { href: "/signup/agent", label: "Agent Application" },
        { href: "/signup/buyer", label: "Buyer Onboarding" },
        { href: "/signup/professor", label: "Professor Invitation" },
      ],
    },
  ],
  footerTagline:
    "B2B2G connects verified suppliers, protected buyer demand, events, services, and innovation showcases through an admin-reviewed marketplace.",
  noticeItems: [],
  noticeTitle: "Announcements",
  rightsLabel: "© 2026 B2B2G. All rights reserved. Buyer identity data is protected by platform policy.",
  sectionId: "marketplace-footer",
  subtitle: "Marketplace links, service gateways, support, and newsletter readiness in one polished footer.",
  title: "Footer",
};

const marketplaceHome: MarketplaceHomeConfig = {
  adBanners: [
    {
      cta: { href: "/signup/supplier", label: "Advertise Products" },
      description: "Promote approved products to verified global buyers with clean, premium marketplace placement.",
      id: "ad-promote-products",
      title: "Promote products to verified global buyers",
    },
    {
      cta: { href: "/signup/supplier", label: "Learn More" },
      description: "Premium supplier benefits prepare your products for stronger visibility, trust badges, and event exposure.",
      id: "ad-premium-benefits",
      title: "Premium supplier benefit programs",
    },
  ],
  announcements: [
    {
      dateLabel: "Jun 30",
      description: "Scheduled maintenance is planned for marketplace inquiry preview and managed RFQ readiness services.",
      href: "/notice",
      id: "home-announcement-maintenance",
      statusLabel: "System",
      title: "Platform system maintenance notice",
    },
    {
      dateLabel: "Jun 26",
      description: "Supplier registration for Thailand Industrial Expo sourcing sessions is now open.",
      href: "/notice",
      id: "home-announcement-thailand-expo",
      statusLabel: "Event",
      title: "Thailand Industrial Expo registration open",
    },
    {
      dateLabel: "Jun 21",
      description: "Verified suppliers can prepare premium exposure requests for the next marketplace cycle.",
      href: "/notice",
      id: "home-announcement-premium-supplier",
      statusLabel: "Supplier",
      title: "New premium supplier program launched",
    },
  ],
  buyerRequests: [
    {
      badge: "RFQ",
      id: "home-request-stainless-steel-sheet",
      imageAlt: "Stainless steel sheet industrial material",
      imageUrl: warehouseImage,
      quantity: "Quantity: 24 tons",
      spec: "Grade 304, thickness 2 mm",
      title: "Stainless Steel Sheet",
    },
    {
      badge: "RFQ",
      id: "home-request-hydraulic-cylinder",
      imageAlt: "Hydraulic cylinder machinery component",
      imageUrl: industrialPumpImage,
      quantity: "Quantity: 300 units",
      spec: "Bore 100 mm, stroke 500 mm",
      title: "Hydraulic Cylinder",
    },
    {
      badge: "RFQ",
      id: "home-request-led-high-bay",
      imageAlt: "Industrial LED lighting system",
      imageUrl: electronicsImage,
      quantity: "Quantity: 1,200 units",
      spec: "Industrial high bay lighting",
      title: "LED Lighting System",
    },
    {
      badge: "RFQ",
      id: "home-request-packaging-film-roll",
      imageAlt: "Packaging film roll material",
      imageUrl: packagingImage,
      quantity: "Quantity: 18 pallets",
      spec: "PET, width 500 mm",
      title: "Packaging Film Roll",
    },
  ],
  events: [
    {
      badge: "Expo",
      dateLabel: "May 28",
      id: "home-event-thailand-industrial-expo",
      imageAlt: "Thailand industrial event hall",
      imageUrl: cityEventImage,
      locationLabel: "Bangkok, Thailand",
      title: "Thailand Industrial Expo 2024",
    },
    {
      badge: "Mission",
      dateLabel: "Jun 15",
      id: "home-event-korea-trade-mission",
      imageAlt: "Korea trade event",
      imageUrl: skylineImage,
      locationLabel: "Seoul, Korea",
      title: "Korea Trade Mission",
    },
    {
      badge: "Summit",
      dateLabel: "Jun 22",
      id: "home-event-procurement-summit",
      imageAlt: "Global procurement summit city",
      imageUrl: logisticsImage,
      locationLabel: "Singapore",
      title: "Global Procurement Summit",
    },
  ],
  faqs: [
    {
      answer: "Start with supplier registration. Admin approval is required before company setup and product publishing are opened.",
      id: "home-faq-verified-supplier",
      question: "How can I become a verified supplier?",
    },
    {
      answer: "Inquiry creation is planned for the managed RFQ workflow. Public marketplace cards do not expose buyer identity data.",
      id: "home-faq-product-inquiry",
      question: "How do I submit a product inquiry?",
    },
    {
      answer: "Buyer requests are routed through admin-reviewed RFQ handling, so buyer identity and identity fields remain hidden from suppliers by default.",
      id: "home-faq-buyer-privacy",
      question: "How is buyer information protected?",
    },
    {
      answer: "Premium supplier placement can improve exposure in product banners, featured rows, and marketplace highlight zones.",
      id: "home-faq-premium",
      question: "How does the premium supplier program work?",
    },
  ],
  latestProducts: [
    ...marketplace.latestProducts.items,
  ],
  premiumProducts: [
    ...marketplace.premiumProducts.items,
  ],
  showcases: [
    ...marketplace.productShowcase.items,
  ],
  verifiedBuyers: [
    ...marketplace.verifiedBuyers.items,
  ],
};

export const staticLandingConfig = {
  hero,
  marketplace,
  marketplaceHome,
  noticeCtaFooter,
};
