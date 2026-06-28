import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CompanyApprovalStatus,
  Database,
  VerificationStatus,
} from "@/types/database";

type Tables = Database["public"]["Tables"];
type CompanyRow = Tables["companies"]["Row"];
type CompanyTypeRow = Tables["company_types"]["Row"];
type CountryRow = Tables["countries"]["Row"];
type IndustryRow = Tables["industries"]["Row"];
type SupplierRow = Tables["suppliers"]["Row"];
type CompanyVerificationRow = Tables["company_verifications"]["Row"];

export type AdminCompanyFilters = {
  approvalStatus?: CompanyApprovalStatus | "all";
  query?: string;
  verificationStatus?: VerificationStatus | "all";
};

export type AdminCompanySummary = {
  active: number;
  approved: number;
  pendingApproval: number;
  rejected: number;
  suspended: number;
  total: number;
  verified: number;
};

export type AdminCompanyItem = {
  approvalStatus: CompanyApprovalStatus;
  companyTypeName: string | null;
  contentCounts: {
    epc: number;
    industrial: number;
    products: number;
  };
  countryName: string | null;
  createdAt: string;
  description: string | null;
  id: string;
  industryName: string | null;
  isActive: boolean;
  lastVerification: Pick<
    CompanyVerificationRow,
    | "business_registration_checked"
    | "catalog_checked"
    | "certificate_checked"
    | "review_note"
    | "reviewed_at"
    | "status"
    | "website_checked"
  > | null;
  name: string;
  slug: string;
  supplierCount: number;
  updatedAt: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  website: string | null;
};

export type AdminCompaniesData = {
  filters: Required<AdminCompanyFilters>;
  items: AdminCompanyItem[];
  summary: AdminCompanySummary;
};

const COMPANY_APPROVAL_STATUSES: CompanyApprovalStatus[] = [
  "draft",
  "submitted",
  "reviewing",
  "approved",
  "rejected",
  "suspended",
];

const COMPANY_VERIFICATION_STATUSES: VerificationStatus[] = [
  "pending",
  "verified",
  "rejected",
  "suspended",
];

function normalizeFilter<T extends string>(
  value: string | undefined,
  validValues: readonly T[],
): T | "all" {
  return validValues.some((item) => item === value) ? (value as T) : "all";
}

function normalizeQuery(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed;
}

function countByCompany(rows: { company_id: string }[] | null): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows ?? []) {
    counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1);
  }

  return counts;
}

function createLookup<T extends { id: string }>(rows: T[] | null): Map<string, T> {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

function createSummary(companies: CompanyRow[] | null): AdminCompanySummary {
  const rows = companies ?? [];

  return {
    active: rows.filter((company) => company.is_active).length,
    approved: rows.filter((company) => company.approval_status === "approved").length,
    pendingApproval: rows.filter((company) =>
      company.approval_status === "submitted" ||
      company.approval_status === "reviewing",
    ).length,
    rejected: rows.filter((company) => company.approval_status === "rejected").length,
    suspended: rows.filter((company) => company.approval_status === "suspended").length,
    total: rows.length,
    verified: rows.filter((company) => company.verification_status === "verified").length,
  };
}

export async function getAdminCompanies(
  filters: AdminCompanyFilters = {},
): Promise<AdminCompaniesData> {
  const normalizedFilters = {
    approvalStatus: normalizeFilter(
      filters.approvalStatus,
      COMPANY_APPROVAL_STATUSES,
    ),
    query: normalizeQuery(filters.query),
    verificationStatus: normalizeFilter(
      filters.verificationStatus,
      COMPANY_VERIFICATION_STATUSES,
    ),
  };
  const supabase = await createSupabaseServerClient();
  const allCompaniesResult = await supabase
    .from("companies")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (allCompaniesResult.error) {
    throw new Error(allCompaniesResult.error.message);
  }

  const companies = allCompaniesResult.data ?? [];

  const companyIds = companies.map((company) => company.id);
  const companyTypeIds = [...new Set(companies.map((company) => company.company_type_id))];
  const countryIds = [...new Set(companies.map((company) => company.country_id))];
  const industryIds = [...new Set(companies.map((company) => company.industry_id))];

  const [
    companyTypesResult,
    countriesResult,
    industriesResult,
    suppliersResult,
    productsResult,
    industrialResult,
    epcResult,
    verificationsResult,
  ] = await Promise.all([
    companyTypeIds.length
      ? supabase
          .from("company_types")
          .select("id,name")
          .in("id", companyTypeIds)
      : Promise.resolve({ data: [] as Pick<CompanyTypeRow, "id" | "name">[], error: null }),
    countryIds.length
      ? supabase.from("countries").select("id,name").in("id", countryIds)
      : Promise.resolve({ data: [] as Pick<CountryRow, "id" | "name">[], error: null }),
    industryIds.length
      ? supabase.from("industries").select("id,name").in("id", industryIds)
      : Promise.resolve({ data: [] as Pick<IndustryRow, "id" | "name">[], error: null }),
    companyIds.length
      ? supabase
          .from("suppliers")
          .select("company_id")
          .in("company_id", companyIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as Pick<SupplierRow, "company_id">[], error: null }),
    companyIds.length
      ? supabase
          .from("products")
          .select("company_id")
          .in("company_id", companyIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { company_id: string }[], error: null }),
    companyIds.length
      ? supabase
          .from("industrial_posts")
          .select("company_id")
          .in("company_id", companyIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { company_id: string }[], error: null }),
    companyIds.length
      ? supabase
          .from("epc_posts")
          .select("company_id")
          .in("company_id", companyIds)
          .is("deleted_at", null)
      : Promise.resolve({ data: [] as { company_id: string }[], error: null }),
    companyIds.length
      ? supabase
          .from("company_verifications")
          .select(
            "company_id,business_registration_checked,catalog_checked,certificate_checked,review_note,reviewed_at,status,website_checked",
          )
          .in("company_id", companyIds)
          .is("deleted_at", null)
          .order("reviewed_at", { ascending: false })
      : Promise.resolve({
          data: [] as Pick<
            CompanyVerificationRow,
            | "business_registration_checked"
            | "catalog_checked"
            | "certificate_checked"
            | "company_id"
            | "review_note"
            | "reviewed_at"
            | "status"
            | "website_checked"
          >[],
          error: null,
        }),
  ]);

  [
    companyTypesResult.error,
    countriesResult.error,
    industriesResult.error,
    suppliersResult.error,
    productsResult.error,
    industrialResult.error,
    epcResult.error,
    verificationsResult.error,
  ].forEach((error) => {
    if (error) {
      throw new Error(error.message);
    }
  });

  const companyTypeById = createLookup(companyTypesResult.data);
  const countryById = createLookup(countriesResult.data);
  const industryById = createLookup(industriesResult.data);
  const supplierCounts = countByCompany(suppliersResult.data);
  const productCounts = countByCompany(productsResult.data);
  const industrialCounts = countByCompany(industrialResult.data);
  const epcCounts = countByCompany(epcResult.data);
  const verificationByCompany = new Map<
    string,
    AdminCompanyItem["lastVerification"]
  >();

  for (const verification of verificationsResult.data ?? []) {
    if (!verificationByCompany.has(verification.company_id)) {
      verificationByCompany.set(verification.company_id, verification);
    }
  }

  return {
    filters: normalizedFilters,
    items: companies.map((company) => ({
      approvalStatus: company.approval_status,
      companyTypeName: companyTypeById.get(company.company_type_id)?.name ?? null,
      contentCounts: {
        epc: epcCounts.get(company.id) ?? 0,
        industrial: industrialCounts.get(company.id) ?? 0,
        products: productCounts.get(company.id) ?? 0,
      },
      countryName: countryById.get(company.country_id)?.name ?? null,
      createdAt: company.created_at,
      description: company.description,
      id: company.id,
      industryName: industryById.get(company.industry_id)?.name ?? null,
      isActive: company.is_active,
      lastVerification: verificationByCompany.get(company.id) ?? null,
      name: company.name,
      slug: company.slug,
      supplierCount: supplierCounts.get(company.id) ?? 0,
      updatedAt: company.updated_at,
      verificationStatus: company.verification_status,
      verifiedAt: company.verified_at,
      website: company.website,
    })),
    summary: createSummary(allCompaniesResult.data),
  };
}
