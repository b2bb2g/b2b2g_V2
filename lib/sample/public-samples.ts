export type SampleMenuKind =
  | "buy-requests"
  | "buy-sell"
  | "commercial"
  | "epc"
  | "events"
  | "industrial"
  | "networking"
  | "notice"
  | "service"
  | "sell-products"
  | "thailand-fda-service";

export type SampleContentItem = {
  body: string;
  companyName?: string | null;
  companySlug?: string | null;
  createdAt: string;
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  meta?: string | null;
  summary?: string | null;
  title: string;
  venue?: string | null;
};

type SampleSeed = {
  company: string;
  meta: string;
  summary: string;
  title: string;
};

const images = {
  buyRequests: [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
  ],
  epc: [
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  ],
  events: [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  ],
  industrial: [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80",
  ],
  networking: [
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  ],
  notice: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  ],
  sellProducts: [
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=80",
  ],
  thailandFda: [
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
  ],
} as const;

const eventVenues = [
  "COEX, Seoul",
  "Online",
  "Online",
  "Dongdaemun Design Plaza, Seoul",
  "Hanoi, Vietnam",
  "Dubai, UAE",
  "B2BB2G Campus, Seoul",
  "Online",
  "KINTEX, Goyang",
  "Online",
  "Bangkok, Thailand",
  "Kuala Lumpur, Malaysia",
  "KINTEX, Goyang",
  "Online",
  "B2BB2G Campus, Seoul",
  "Tokyo, Japan",
  "Abu Dhabi, UAE",
  "COEX, Seoul",
  "Online",
  "B2BB2G Campus, Seoul",
] as const;

const samples: Record<Exclude<SampleMenuKind, "thailand-fda-service">, SampleSeed[]> = {
  commercial: [
    ["K-Beauty Peptide Ampoule", "Cosmetics", "Functional serum line for Southeast Asian distributors."],
    ["Vegan Sunscreen Stick", "Cosmetics", "Compact SPF product ready for cross-border retail."],
    ["Fermented Red Ginseng Drink", "Food Supplement", "Premium wellness beverage for pharmacy channels."],
    ["Smart Air Purifier Filter", "Home Appliance", "Replacement filter program for regional retailers."],
    ["Korean Protein Snack Bar", "Food", "Export-ready snack range for modern trade buyers."],
    ["Dental Whitening Kit", "Personal Care", "Clinic and retail whitening package with Korean formulation."],
    ["Premium Baby Wet Wipes", "Consumer Goods", "Soft-pack baby care product for wholesale buyers."],
    ["LED Skincare Mask", "Beauty Device", "Home beauty device with distributor support package."],
    ["Collagen Jelly Pouch", "Food Supplement", "Convenience wellness SKU for online and offline channels."],
    ["Eco Laundry Sheet", "Household", "Low-volume detergent format for export consolidation."],
    ["Propolis Oral Spray", "Health Care", "Travel-size oral care item for pharmacy buyers."],
    ["Rice Bran Cleansing Oil", "Cosmetics", "Natural ingredient cleansing line for beauty retailers."],
    ["Freeze-Dried Kimchi Snack", "Food", "Shelf-stable Korean snack for specialty importers."],
    ["Ceramide Body Lotion", "Personal Care", "Sensitive skin body care line with export documentation."],
    ["Portable Water Flosser", "Beauty Device", "Rechargeable oral care device for retail chains."],
    ["Premium Seaweed Pack", "Food", "Private-label ready roasted seaweed assortment."],
    ["Korean Tea Gift Set", "Food", "Corporate and retail tea set for seasonal campaigns."],
    ["Hyaluronic Acid Toner", "Cosmetics", "High-volume toner product for beauty distributors."],
    ["Smart Pet Feeder", "Consumer Electronics", "Connected pet care product for online marketplace buyers."],
    ["Reusable Food Container", "Household", "BPA-free container line for regional importers."],
  ].map(toSeed),
  industrial: [
    ["CNC Precision Machining Cell", "Machinery", "Automated machining cell for automotive component plants."],
    ["Compact Injection Molding Line", "Factory Equipment", "Mid-size molding line with Korean engineering support."],
    ["Industrial Water Treatment Skid", "Plant Utility", "Modular skid for factory wastewater pretreatment."],
    ["Smart Conveyor System", "Logistics Automation", "Configurable conveyor line for warehouse modernization."],
    ["Lithium Battery Assembly Jig", "Battery", "Production jig package for battery module assembly."],
    ["Stainless Mixing Tank", "Food Processing", "Sanitary tank for food and supplement factories."],
    ["Robotic Palletizing Cell", "Automation", "End-of-line automation cell for export manufacturers."],
    ["Cleanroom Air Shower", "Cleanroom", "Factory access control unit for regulated production areas."],
    ["Powder Filling Machine", "Packaging", "Semi-automatic filler for supplement and food powder lines."],
    ["Industrial Chiller Unit", "Utilities", "Energy-efficient chiller for process cooling."],
    ["Vision Inspection Station", "Quality Control", "Camera inspection station for defect detection."],
    ["High-Pressure Compressor", "Plant Equipment", "Industrial compressor with maintenance package."],
    ["Sheet Metal Fabrication Line", "Materials", "Flexible line for enclosure and cabinet manufacturing."],
    ["Automated Carton Sealer", "Packaging", "Packaging automation unit for distribution centers."],
    ["Factory IoT Gateway", "Smart Factory", "Edge gateway for machine monitoring and KPI capture."],
    ["Servo Press Machine", "Machinery", "Precision servo press for electronics and parts makers."],
    ["Food Sterilization Tunnel", "Food Processing", "Continuous sterilization unit for packaged goods."],
    ["Chemical Storage Module", "Plant Safety", "Compliant storage module for industrial chemicals."],
    ["Laser Marking System", "Manufacturing", "High-speed marking station for serial traceability."],
    ["Warehouse Lift Platform", "Logistics", "Hydraulic lift platform for warehouse operations."],
  ].map(toSeed),
  epc: [
    ["Solar Farm EPC Partner Package", "Renewable Energy", "Korean EPC consortium for utility-scale solar projects."],
    ["Food Factory Turnkey Build", "Food Plant", "Design-build proposal for food processing facilities."],
    ["Water Reuse Plant Upgrade", "Water", "Engineering package for municipal water reuse capacity."],
    ["Battery Materials Pilot Plant", "Battery", "Pilot plant engineering for cathode material production."],
    ["Cold Chain Warehouse EPC", "Logistics", "Turnkey cold storage project for regional food distribution."],
    ["Cosmetic GMP Facility", "Regulated Factory", "GMP-ready facility design and equipment sourcing."],
    ["Industrial Boiler Replacement", "Energy", "Efficiency retrofit for aging boiler systems."],
    ["Port Logistics Automation", "Infrastructure", "Automation package for port-side logistics operations."],
    ["Medical Device Cleanroom", "Healthcare", "Cleanroom construction for medical device manufacturing."],
    ["Waste-to-Energy Feasibility", "Energy", "Early-stage engineering and supplier mapping package."],
    ["Smart Factory Conversion", "Factory Digital", "Brownfield digital conversion for legacy factories."],
    ["Palm Oil Refinery Utility Upgrade", "Process Plant", "Utility and safety upgrade for refinery operations."],
    ["Hydrogen Filling Pilot Station", "Hydrogen", "Pilot station engineering with Korean equipment partners."],
    ["Airport MRO Facility", "Aviation", "Maintenance facility concept and supplier package."],
    ["Industrial Park Substation", "Power", "Substation EPC support for industrial park expansion."],
    ["Pharma Packaging Facility", "Pharma", "Regulated packaging plant design and validation support."],
    ["Desalination Pretreatment Line", "Water", "Pretreatment EPC package for coastal facilities."],
    ["Data Center Cooling Plant", "Data Center", "Cooling utility plant for high-density server facilities."],
    ["Grain Terminal Modernization", "Agribusiness", "Handling and automation upgrade for grain terminals."],
    ["EV Charger Depot Build", "Mobility", "Depot charging infrastructure for fleet operators."],
  ].map(toSeed),
  events: [
    ["Seoul Global Trade Matching Day", "Trade Event", "Curated supplier and buyer meetings for export-ready companies."],
    ["Thailand FDA Readiness Webinar", "Webinar", "Regulatory briefing for cosmetics and supplement exporters."],
    ["Industrial Equipment Buyer Week", "Buyer Mission", "Online sourcing week for machinery and factory assets."],
    ["K-Beauty Distributor Roundtable", "Roundtable", "Regional distributor matching for Korean beauty brands."],
    ["Vietnam Manufacturing Delegation", "Delegation", "Factory visit and supplier screening program."],
    ["Middle East EPC Partner Forum", "Forum", "Project owner and EPC partner networking session."],
    ["Global Trade Student Demo Day", "Academy", "Student showcase presentations for buyer acquisition projects."],
    ["Food Supplement Export Clinic", "Clinic", "One-on-one documentation and market entry review."],
    ["Smart Factory Partner Session", "Partnering", "Automation supplier and factory operator matching."],
    ["Buyer Referral Program Briefing", "Program", "Referral operations session for approved buyers."],
    ["Medical Device Market Entry Day", "Regulatory", "Market access briefing and partner discovery."],
    ["ASEAN Retail Buyer Meet", "Buyer Meet", "Retail channel sourcing session for Korean consumer goods."],
    ["Industrial Safety Product Showcase", "Showcase", "Approved suppliers present safety and compliance products."],
    ["EPC Tender Readiness Workshop", "Workshop", "Tender documentation and consortium preparation."],
    ["Export Catalog Review Day", "Review", "Catalog and company profile review for supplier teams."],
    ["Japan Specialty Buyer Session", "Buyer Meet", "Focused sourcing session for premium Korean products."],
    ["UAE Project Opportunity Brief", "Briefing", "Infrastructure and facility project opportunity review."],
    ["Global B2B Networking Night", "Networking", "Member-only business networking program."],
    ["FDA Label Compliance Lab", "Lab", "Hands-on review for Thai label compliance."],
    ["Korean Supplier Verification Day", "Verification", "Company verification and public profile readiness session."],
  ].map(toSeed),
  "buy-sell": [
    ["Premium Skincare OEM Capacity", "SELL PRODUCTS", "Supplier offers export-ready skincare OEM capacity."],
    ["Buyer Seeking Collagen Drinks", "BUY REQUEST", "Importer requests functional beverage suppliers from Korea."],
    ["Factory Automation Package", "SELL PRODUCTS", "Industrial supplier offers automation equipment package."],
    ["Hospital Consumables Needed", "BUY REQUEST", "Distributor seeks certified medical consumables."],
    ["Food Supplement Capsule Line", "SELL PRODUCTS", "Manufacturer offers private-label supplement products."],
    ["Cosmetic Packaging Supplier Search", "BUY REQUEST", "Brand owner requests Korean packaging partners."],
    ["Stainless Tank Fabrication", "SELL PRODUCTS", "Factory equipment supplier offers sanitary tank production."],
    ["EPC Partner for Solar Project", "BUY REQUEST", "Project owner seeks Korean EPC partner."],
    ["Korean Snack Export Bundle", "SELL PRODUCTS", "Supplier promotes mixed snack container program."],
    ["Smart Factory Sensors Needed", "BUY REQUEST", "Manufacturer requests sensors and gateway suppliers."],
    ["Cleanroom Equipment Offer", "SELL PRODUCTS", "Supplier offers air showers and cleanroom furniture."],
    ["Thailand FDA Label Review", "BUY REQUEST", "Distributor requests label compliance service."],
    ["Beauty Device Distributor Offer", "SELL PRODUCTS", "Supplier seeks regional distributors for beauty devices."],
    ["Water Treatment Module Search", "BUY REQUEST", "Factory buyer requests modular treatment systems."],
    ["Reusable Household Goods", "SELL PRODUCTS", "Export-ready household line for retail chains."],
    ["Medical Device OEM Inquiry", "BUY REQUEST", "Importer seeks Korean device OEM manufacturer."],
    ["Industrial Compressor Offer", "SELL PRODUCTS", "Supplier promotes compressor and maintenance package."],
    ["Organic Tea Private Label", "BUY REQUEST", "Retail buyer requests Korean tea private-label program."],
    ["Battery Assembly Tooling", "SELL PRODUCTS", "Supplier offers battery module tooling package."],
    ["Airport Facility Partner Search", "BUY REQUEST", "Infrastructure buyer seeks MRO facility partners."],
  ].map(toSeed),
  "sell-products": [
    ["Skincare OEM Starter Bundle", "Cosmetics", "Low-MOQ OEM bundle for regional beauty distributors."],
    ["Industrial Sensor Gateway", "Smart Factory", "Gateway and sensor package for production monitoring."],
    ["Food Supplement Sachet Line", "Food Supplement", "Private-label sachet product for pharmacy channels."],
    ["Cleanroom Furniture Set", "Cleanroom", "Stainless furniture package for regulated facilities."],
    ["Korean Tea Retail Bundle", "Food", "Retail-ready tea assortment for premium channels."],
    ["Portable Beauty Device", "Beauty Device", "Handheld device with distributor onboarding package."],
    ["Packaging Automation Unit", "Packaging", "Compact unit for carton sealing and labeling."],
    ["Water Treatment Filter Pack", "Industrial", "Replacement filter pack for plant maintenance buyers."],
    ["Ceramide Skin Care Range", "Cosmetics", "Moisturizing range for export distributors."],
    ["Laser Marking Station", "Manufacturing", "Traceability station for electronics and parts factories."],
    ["Korean Seaweed Export Box", "Food", "Mixed seaweed SKU set for import wholesalers."],
    ["Factory Safety Cabinet", "Plant Safety", "Compliant cabinet for chemical and tool storage."],
    ["Dental Care Retail Line", "Personal Care", "Oral care products for pharmacy and retail chains."],
    ["Servo Press Package", "Machinery", "Precision press with setup and training support."],
    ["Pet Care Device Bundle", "Consumer Electronics", "Connected pet feeder and accessory package."],
    ["Sanitary Mixing Tank", "Food Processing", "Tank package for food and supplement plants."],
    ["Eco Detergent Sheet", "Household", "Export-ready detergent sheet product."],
    ["Robotic Palletizing Cell", "Automation", "End-of-line palletizing solution."],
    ["Collagen Jelly OEM", "Food Supplement", "Private-label collagen jelly program."],
    ["Industrial Chiller Offer", "Factory Utility", "Chiller package for process cooling."],
  ].map(toSeed),
  "buy-requests": [
    ["Distributor seeks SPF cosmetics", "Thailand", "Buyer needs Korean sunscreen products with export documents."],
    ["Factory requests CNC suppliers", "Vietnam", "Manufacturer is sourcing compact CNC machining systems."],
    ["Retail chain needs Korean snacks", "UAE", "Importer requests shelf-stable Korean snack suppliers."],
    ["Project owner seeks solar EPC", "Thailand", "Developer is looking for Korean EPC consortium partners."],
    ["Pharmacy buyer seeks supplements", "Japan", "Buyer requests capsule and jelly supplement manufacturers."],
    ["Plant needs water treatment skid", "Indonesia", "Factory buyer requests modular wastewater pretreatment."],
    ["Beauty distributor seeks devices", "Spain", "Distributor wants Korean home beauty devices."],
    ["Food plant requests sterilizer", "Vietnam", "Processor needs continuous sterilization equipment."],
    ["Importer seeks seaweed products", "United States", "Buyer wants premium roasted seaweed SKUs."],
    ["Cleanroom project needs suppliers", "Thailand", "Contractor requests cleanroom equipment partners."],
    ["Retailer seeks household goods", "Malaysia", "Retail buyer requests eco household product suppliers."],
    ["Battery plant needs tooling", "China", "Buyer seeks module assembly tooling suppliers."],
    ["Hospital buyer seeks consumables", "UAE", "Distributor requests certified disposable medical supplies."],
    ["Brand seeks cosmetic packaging", "Japan", "Brand owner needs packaging and filling partners."],
    ["Warehouse needs conveyors", "Vietnam", "Logistics operator requests smart conveyor systems."],
    ["Tea importer seeks private label", "United States", "Buyer requests Korean tea gift set suppliers."],
    ["Factory seeks compressor package", "Thailand", "Maintenance team needs compressor replacement options."],
    ["Distributor needs oral care", "Philippines", "Buyer requests oral spray and whitening kit lines."],
    ["EPC firm seeks substation partner", "UAE", "Project team requests Korean power engineering partners."],
    ["Importer seeks FDA consulting", "Thailand", "Buyer requests Thailand FDA service partner."],
  ].map(toSeed),
  networking: [
    ["Thailand Buyer Circle", "Buyer Network", "Approved buyers sourcing Korean products for Thai channels."],
    ["Vietnam Industrial Agents", "Agent Network", "Country agents supporting industrial project discovery."],
    ["K-Beauty Distributor Desk", "Distributor", "Regional distributors interested in Korean beauty brands."],
    ["EPC Project Partner Board", "Project Network", "Project owners and EPC partners sharing opportunities."],
    ["Professor Trade Mentor Group", "Academy", "Professors mentoring student trade activity."],
    ["Global Trade Student Team", "Student Network", "Student ambassadors supporting showcase and research."],
    ["Food Supplement Buyer Pool", "Buyer Network", "Buyers focused on regulated supplement products."],
    ["Medical Device Entry Partners", "Regulatory Network", "Partners supporting medical device market entry."],
    ["Middle East Infrastructure Desk", "Project Network", "Regional project leads for EPC and equipment."],
    ["Japan Premium Retail Group", "Buyer Network", "Retail buyers evaluating Korean premium goods."],
    ["Factory Automation Partners", "Industrial Network", "Automation integrators and factory operators."],
    ["Thailand FDA Advisor Pool", "Service Network", "Consultants supporting Thai registration workflows."],
    ["Export Catalog Reviewers", "Operations", "Reviewers improving supplier public profiles."],
    ["Country Agent Leadership Table", "Agent Network", "Assigned agents coordinating country demand."],
    ["Buyer Referral Operators", "Referral Network", "Parent buyers managing approved referral relations."],
    ["Cleanroom Project Network", "Industrial Network", "Suppliers and buyers for regulated facility projects."],
    ["ASEAN Retail Matching Group", "Buyer Network", "Retail sourcing group for ASEAN distribution."],
    ["Smart Factory Innovation Circle", "Technology", "Factories and suppliers exploring digital upgrades."],
    ["Global B2B Legal Desk", "Advisory", "Advisors supporting trade documentation and compliance."],
    ["Korean Supplier Alumni Board", "Community", "Verified suppliers sharing export readiness practices."],
  ].map(toSeed),
  notice: [
    ["Platform approval policy update", "Operations", "Public content remains hidden until administrator approval."],
    ["Thailand FDA service category notice", "Service", "Supported service categories and review flow updated."],
    ["Buyer referral visibility rule", "Privacy", "Referral views continue to mask sensitive buyer information."],
    ["Supplier profile readiness guide", "Guide", "Approved suppliers should complete company and catalog data."],
    ["BUY REQUEST submission guide", "Guide", "Buyer requests must include destination and sourcing details."],
    ["Event participation review notice", "Event", "Event applications are reviewed before confirmation."],
    ["Student showcase approval reminder", "Academy", "Student showcase pages require approval before publication."],
    ["Company verification separation", "Policy", "Company approval and verification remain separate statuses."],
    ["Admin audit log notice", "Security", "Critical administrative actions are recorded for review."],
    ["Public menu structure notice", "Navigation", "Academy content is available only after member login."],
    ["Commercial product listing notice", "Marketplace", "Product listings are supplier or administrator controlled."],
    ["Industrial content listing notice", "Marketplace", "Industrial posts require supplier ownership and approval."],
    ["EPC opportunity listing notice", "Project", "EPC posts are reviewed before public exposure."],
    ["Messaging scope notice", "Communication", "Conversations are limited by membership and organization scope."],
    ["File attachment policy", "Security", "Private files are not exposed through public pages."],
    ["Translation key management notice", "i18n", "UI labels are maintained through translation keys."],
    ["Maintenance window sample notice", "Operations", "Scheduled maintenance notices will appear in this section."],
    ["Company score preview notice", "Analytics", "Visibility score uses approved profile and activity signals."],
    ["Catalog download tracking notice", "Analytics", "Catalog interest can be tracked after launch readiness."],
    ["Production deployment readiness", "Deployment", "Quality, RLS, and environment checks are required before launch."],
  ].map(toSeed),
  service: [
    ["Thailand FDA Service Desk", "Active Service", "Current active service track for Thailand market entry and regulatory support."],
    ["Cosmetic Registration Review", "Thailand FDA", "Ingredient and document readiness review for Thai cosmetic registration."],
    ["Food Supplement Dossier Check", "Thailand FDA", "Supplement formula, label, and importer document check."],
    ["Food Product Notification", "Thailand FDA", "Food category review and registration support workflow."],
    ["Medical Device Classification", "Thailand FDA", "Device classification and required document mapping."],
    ["Import License Support", "Thailand FDA", "Importer license preparation and application support."],
    ["Thai Label Compliance Review", "Thailand FDA", "Label wording, claims, and mandatory field review."],
    ["Formula Risk Screening", "Thailand FDA", "Restricted ingredient and claim risk screening."],
    ["Cosmetic Claims Audit", "Thailand FDA", "Marketing claim and product category audit."],
    ["Supplement Label Translation", "Thailand FDA", "English to Thai label compliance coordination."],
    ["Factory Document Checklist", "Document Review", "GMP, COA, and manufacturer document checklist."],
    ["Importer Matching Support", "Partner Support", "Importer-side support partner discovery."],
    ["Medical Device File Gap Check", "Thailand FDA", "Registration file gap assessment for devices."],
    ["Food Category Confirmation", "Thailand FDA", "Category and route confirmation before submission."],
    ["Ingredient Name Harmonization", "Formula Review", "INCI and local naming consistency review."],
    ["Artwork Preflight Review", "Label Compliance", "Packaging artwork review before printing."],
    ["Cosmetic Renewal Support", "Thailand FDA", "Renewal readiness and document update workflow."],
    ["Supplement Claim Risk Review", "Thailand FDA", "Health claim and evidence review before filing."],
    ["Sample Import Document Check", "Import License", "Document support for sample import and testing."],
    ["New Service Placeholder", "Future Service", "Administrators can add additional service programs as the catalog expands."],
  ].map(toSeed),
};

function toSeed([title, meta, summary]: string[]): SampleSeed {
  return {
    company: "B2BB2G Sample Network",
    meta: meta ?? "B2BB2G",
    summary: summary ?? "",
    title: title ?? "B2BB2G Sample",
  };
}

function imagePoolForKind(kind: SampleMenuKind): readonly string[] {
  if (kind === "buy-requests") return images.buyRequests;
  if (kind === "buy-sell") return images.sellProducts;
  if (kind === "sell-products") return images.sellProducts;
  if (kind === "service" || kind === "thailand-fda-service") return images.thailandFda;

  return images[kind];
}

function routeForKind(kind: SampleMenuKind): string {
  if (kind === "buy-requests") return "/buy-sell/buy-requests";
  if (kind === "sell-products") return "/buy-sell/sell-products";
  if (kind === "thailand-fda-service") return "/service";
  return `/${kind}`;
}

export function getSampleItems(kind: SampleMenuKind): SampleContentItem[] {
  const route = routeForKind(kind);
  const imagePool = imagePoolForKind(kind);

  const sampleRows = kind === "thailand-fda-service" ? samples.service : samples[kind];

  return sampleRows.map((sample, index) => {
    const itemNumber = String(index + 1).padStart(2, "0");
    const id = `sample-${kind === "thailand-fda-service" ? "service" : kind}-${itemNumber}`;

    return {
      body: `${sample.summary}\n\nThis sample record is prepared to show how approved B2BB2G.COM content will appear with image-led discovery, verified business context, and clear buyer action paths.`,
      companyName: sample.company,
      companySlug: null,
      createdAt: `2026-06-${String(20 - (index % 20)).padStart(2, "0")}T00:00:00.000Z`,
      href: `${route}/${id}`,
      id,
      imageAlt: sample.title,
      imageUrl: imagePool[index % imagePool.length],
      meta: sample.meta,
      summary: sample.summary,
      title: sample.title,
      venue: kind === "events" ? eventVenues[index % eventVenues.length] : null,
    };
  });
}

export function getSampleItem(
  kind: SampleMenuKind,
  id: string,
): SampleContentItem | null {
  return getSampleItems(kind).find((item) => item.id === id) ?? null;
}

export function mergeWithSamples<T extends { id: string }>(
  kind: SampleMenuKind,
  items: T[],
  sampleLimit = 20,
): (T | SampleContentItem)[] {
  const existingIds = new Set(items.map((item) => item.id));
  const sampleItems = getSampleItems(kind).filter((item) => !existingIds.has(item.id));

  return [...items, ...sampleItems.slice(0, sampleLimit)];
}
