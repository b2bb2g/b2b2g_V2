import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

type CompanyRow = Tables["companies"]["Row"];
type CompanyScoreRow = Tables["company_scores"]["Row"];
type CompanyTypeRow = Tables["company_types"]["Row"];
type CountryRow = Tables["countries"]["Row"];
type IndustryRow = Tables["industries"]["Row"];
type ProductRow = Tables["products"]["Row"];
type IndustrialPostRow = Tables["industrial_posts"]["Row"];
type EpcPostRow = Tables["epc_posts"]["Row"];
type BuyRequestRow = Tables["buy_requests"]["Row"];

export type PublicCompanyProfile = {
  buyRequests: Pick<BuyRequestRow, "id" | "title" | "quantity" | "target_price">[];
  company: CompanyRow;
  companyType: Pick<CompanyTypeRow, "code" | "name"> | null;
  country: Pick<CountryRow, "code" | "name"> | null;
  epcPosts: Pick<EpcPostRow, "id" | "project_scope" | "summary" | "title">[];
  industrialPosts: Pick<IndustrialPostRow, "id" | "summary" | "title">[];
  industry: Pick<IndustryRow, "code" | "name"> | null;
  products: Pick<ProductRow, "id" | "summary" | "title">[];
  score: Pick<
    CompanyScoreRow,
    | "product_score"
    | "profile_completion_score"
    | "response_score"
    | "score"
    | "verification_score"
  > | null;
};

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export async function getPublicCompanyProfile(
  slug: string,
): Promise<PublicCompanyProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  throwIfError(companyError);

  if (!company) {
    return null;
  }

  const [
    companyTypeResult,
    countryResult,
    industryResult,
    scoreResult,
    productsResult,
    industrialPostsResult,
    epcPostsResult,
    buyRequestsResult,
  ] = await Promise.all([
    supabase
      .from("company_types")
      .select("code,name")
      .eq("id", company.company_type_id)
      .maybeSingle(),
    supabase
      .from("countries")
      .select("code,name")
      .eq("id", company.country_id)
      .maybeSingle(),
    supabase
      .from("industries")
      .select("code,name")
      .eq("id", company.industry_id)
      .maybeSingle(),
    supabase
      .from("company_scores")
      .select(
        "score,profile_completion_score,product_score,verification_score,response_score",
      )
      .eq("company_id", company.id)
      .eq("is_public", true)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id,title,summary")
      .eq("company_id", company.id)
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("industrial_posts")
      .select("id,title,summary")
      .eq("company_id", company.id)
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("epc_posts")
      .select("id,title,summary,project_scope")
      .eq("company_id", company.id)
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("buy_requests")
      .select("id,title,quantity,target_price")
      .eq("destination_country_id", company.country_id)
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  [
    companyTypeResult.error,
    countryResult.error,
    industryResult.error,
    scoreResult.error,
    productsResult.error,
    industrialPostsResult.error,
    epcPostsResult.error,
    buyRequestsResult.error,
  ].forEach(throwIfError);

  return {
    buyRequests: buyRequestsResult.data ?? [],
    company,
    companyType: companyTypeResult.data,
    country: countryResult.data,
    epcPosts: epcPostsResult.data ?? [],
    industrialPosts: industrialPostsResult.data ?? [],
    industry: industryResult.data,
    products: productsResult.data ?? [],
    score: scoreResult.data,
  };
}
