import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApprovalTargetTable } from "@/lib/validators/admin-actions";

type ApprovalStatus = "reviewing" | "submitted";

export type ApprovalQueueItem = {
  createdAt: string;
  detailHref: string | null;
  id: string;
  metadata?: {
    label: string;
    tone: "info" | "neutral" | "positive" | "warning";
    value: string;
  }[];
  summary: string | null;
  targetLabelKey: string;
  targetTable: ApprovalTargetTable;
  title: string;
  updatedAt: string;
  status: ApprovalStatus;
};

export type ProductPublishQueueItem = {
  companyName: string | null;
  createdAt: string;
  hasApprovedCompany: boolean;
  hasPublicImage: boolean;
  hasSummary: boolean;
  id: string;
  isPublishReady: boolean;
  publishStatus: "archived" | "draft" | "hidden";
  readiness: {
    label: string;
    tone: "info" | "neutral" | "positive" | "warning";
    value: string;
  }[];
  summary: string | null;
  title: string;
  updatedAt: string;
};

export type ApprovalQueueSection = {
  emptyKey: string;
  items: ApprovalQueueItem[];
  targetLabelKey: string;
  targetTable: ApprovalTargetTable;
};

const PENDING_APPROVAL_STATUSES: ApprovalStatus[] = ["submitted", "reviewing"];

const APPROVAL_SECTIONS: readonly {
  emptyKey: string;
  targetLabelKey: string;
  targetTable: ApprovalTargetTable;
}[] = [
  {
    emptyKey: "admin.approval.empty.companies",
    targetLabelKey: "admin.approval.target.companies",
    targetTable: "companies",
  },
  {
    emptyKey: "admin.approval.empty.products",
    targetLabelKey: "admin.approval.target.products",
    targetTable: "products",
  },
  {
    emptyKey: "admin.approval.empty.industrial",
    targetLabelKey: "admin.approval.target.industrial",
    targetTable: "industrial_posts",
  },
  {
    emptyKey: "admin.approval.empty.epc",
    targetLabelKey: "admin.approval.target.epc",
    targetTable: "epc_posts",
  },
  {
    emptyKey: "admin.approval.empty.sellProducts",
    targetLabelKey: "admin.approval.target.sellProducts",
    targetTable: "buy_sell_posts",
  },
  {
    emptyKey: "admin.approval.empty.buyRequests",
    targetLabelKey: "admin.approval.target.buyRequests",
    targetTable: "buy_requests",
  },
  {
    emptyKey: "admin.approval.empty.studentShowcases",
    targetLabelKey: "admin.approval.target.studentShowcases",
    targetTable: "student_showcases",
  },
  {
    emptyKey: "admin.approval.empty.marketResearch",
    targetLabelKey: "admin.approval.target.marketResearch",
    targetTable: "market_research_reports",
  },
];

function toText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function createItem(input: {
  createdAt: string;
  detailHref?: string | null;
  id: string;
  status: ApprovalStatus;
  summary?: string | null;
  targetLabelKey: string;
  targetTable: ApprovalTargetTable;
  title: string;
  updatedAt: string;
  metadata?: ApprovalQueueItem["metadata"];
}): ApprovalQueueItem {
  return {
    createdAt: input.createdAt,
    detailHref: input.detailHref ?? null,
    id: input.id,
    metadata: input.metadata,
    status: input.status,
    summary: toText(input.summary),
    targetLabelKey: input.targetLabelKey,
    targetTable: input.targetTable,
    title: input.title,
    updatedAt: input.updatedAt,
  };
}

async function getCompanyItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,slug,description,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((company) =>
    createItem({
      createdAt: company.created_at,
      detailHref: `/companies/${company.slug}`,
      id: company.id,
      status: company.approval_status as ApprovalStatus,
      summary: company.description,
      targetLabelKey: "admin.approval.target.companies",
      targetTable: "companies",
      title: company.name,
      updatedAt: company.updated_at,
    }),
  );
}

async function getProductItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,title,summary,approval_status,publish_status,is_active,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((product) =>
    createItem({
      createdAt: product.created_at,
      detailHref: null,
      id: product.id,
      metadata: [
        {
          label: "admin.approval.product.publishStatus",
          tone: product.publish_status === "published" ? "positive" : "warning",
          value: `admin.approval.publishStatus.${product.publish_status}`,
        },
        {
          label: "admin.approval.product.publicReadiness",
          tone: "warning",
          value: "admin.approval.product.publicReadinessAfterApproval",
        },
      ],
      status: product.approval_status as ApprovalStatus,
      summary: product.summary,
      targetLabelKey: "admin.approval.target.products",
      targetTable: "products",
      title: product.title,
      updatedAt: product.updated_at,
    }),
  );
}

export async function getProductPublishQueue(): Promise<ProductPublishQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,summary,publish_status,company_id,main_file_id,created_at,updated_at")
    .eq("approval_status", "approved")
    .in("publish_status", ["draft", "hidden", "archived"])
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  const productRows = products ?? [];
  const companyIds = Array.from(new Set(productRows.map((product) => product.company_id)));
  const fileIds = Array.from(
    new Set(
      productRows
        .map((product) => product.main_file_id)
        .filter((fileId): fileId is string => Boolean(fileId)),
    ),
  );

  const [companyResult, fileResult] = await Promise.all([
    companyIds.length > 0
      ? supabase
          .from("companies")
          .select("id,name,approval_status,is_active,deleted_at")
          .in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    fileIds.length > 0
      ? supabase
          .from("files")
          .select("id,visibility,deleted_at")
          .in("id", fileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (companyResult.error) {
    throw new Error(companyResult.error.message);
  }

  if (fileResult.error) {
    throw new Error(fileResult.error.message);
  }

  const companiesById = new Map(
    (companyResult.data ?? []).map((company) => [company.id, company]),
  );
  const filesById = new Map((fileResult.data ?? []).map((file) => [file.id, file]));

  return productRows.map((product) => {
    const summary = toText(product.summary);
    const company = companiesById.get(product.company_id) ?? null;
    const mainFile = product.main_file_id
      ? (filesById.get(product.main_file_id) ?? null)
      : null;
    const hasSummary = Boolean(summary);
    const hasApprovedCompany = Boolean(
      company &&
        company.approval_status === "approved" &&
        company.is_active &&
        !company.deleted_at,
    );
    const hasPublicImage = Boolean(
      mainFile && mainFile.visibility === "public" && !mainFile.deleted_at,
    );
    const isPublishReady = hasSummary && hasApprovedCompany;

    return {
      companyName: company?.name ?? null,
      createdAt: product.created_at,
      hasApprovedCompany,
      hasPublicImage,
      hasSummary,
      id: product.id,
      isPublishReady,
      publishStatus: product.publish_status as ProductPublishQueueItem["publishStatus"],
      readiness: [
        {
          label: "admin.approval.publishReadiness.summary",
          tone: hasSummary ? "positive" : "warning",
          value: hasSummary
            ? "admin.approval.publishReadiness.ready"
            : "admin.approval.publishReadiness.missing",
        },
        {
          label: "admin.approval.publishReadiness.company",
          tone: hasApprovedCompany ? "positive" : "warning",
          value: hasApprovedCompany
            ? (company?.name ?? "admin.approval.publishReadiness.ready")
            : "admin.approval.publishReadiness.companyMissing",
        },
        {
          label: "admin.approval.publishReadiness.image",
          tone: hasPublicImage ? "positive" : "info",
          value: hasPublicImage
            ? "admin.approval.publishReadiness.publicImage"
            : "admin.approval.publishReadiness.fallbackImage",
        },
      ],
      summary,
      title: product.title,
      updatedAt: product.updated_at,
    };
  });
}

async function getIndustrialItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("industrial_posts")
    .select("id,title,summary,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((post) =>
    createItem({
      createdAt: post.created_at,
      detailHref: `/industrial/${post.id}`,
      id: post.id,
      status: post.approval_status as ApprovalStatus,
      summary: post.summary,
      targetLabelKey: "admin.approval.target.industrial",
      targetTable: "industrial_posts",
      title: post.title,
      updatedAt: post.updated_at,
    }),
  );
}

async function getEpcItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("epc_posts")
    .select("id,title,summary,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((post) =>
    createItem({
      createdAt: post.created_at,
      detailHref: `/epc/${post.id}`,
      id: post.id,
      status: post.approval_status as ApprovalStatus,
      summary: post.summary,
      targetLabelKey: "admin.approval.target.epc",
      targetTable: "epc_posts",
      title: post.title,
      updatedAt: post.updated_at,
    }),
  );
}

async function getSellProductItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("buy_sell_posts")
    .select("id,title,description,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((post) =>
    createItem({
      createdAt: post.created_at,
      detailHref: `/buy-sell/sell-products/${post.id}`,
      id: post.id,
      status: post.approval_status as ApprovalStatus,
      summary: post.description,
      targetLabelKey: "admin.approval.target.sellProducts",
      targetTable: "buy_sell_posts",
      title: post.title,
      updatedAt: post.updated_at,
    }),
  );
}

async function getBuyRequestItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("buy_requests")
    .select("id,title,details,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((request) =>
    createItem({
      createdAt: request.created_at,
      detailHref: `/buy-sell/buy-requests/${request.id}`,
      id: request.id,
      status: request.approval_status as ApprovalStatus,
      summary: request.details,
      targetLabelKey: "admin.approval.target.buyRequests",
      targetTable: "buy_requests",
      title: request.title,
      updatedAt: request.updated_at,
    }),
  );
}

async function getStudentShowcaseItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_showcases")
    .select("id,title,description,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((showcase) =>
    createItem({
      createdAt: showcase.created_at,
      id: showcase.id,
      status: showcase.approval_status as ApprovalStatus,
      summary: showcase.description,
      targetLabelKey: "admin.approval.target.studentShowcases",
      targetTable: "student_showcases",
      title: showcase.title,
      updatedAt: showcase.updated_at,
    }),
  );
}

async function getMarketResearchItems(): Promise<ApprovalQueueItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("market_research_reports")
    .select("id,title,summary,approval_status,created_at,updated_at")
    .in("approval_status", PENDING_APPROVAL_STATUSES)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((report) =>
    createItem({
      createdAt: report.created_at,
      id: report.id,
      status: report.approval_status as ApprovalStatus,
      summary: report.summary,
      targetLabelKey: "admin.approval.target.marketResearch",
      targetTable: "market_research_reports",
      title: report.title,
      updatedAt: report.updated_at,
    }),
  );
}

async function getSectionItems(
  targetTable: ApprovalTargetTable,
): Promise<ApprovalQueueItem[]> {
  switch (targetTable) {
    case "companies":
      return getCompanyItems();
    case "products":
      return getProductItems();
    case "industrial_posts":
      return getIndustrialItems();
    case "epc_posts":
      return getEpcItems();
    case "buy_sell_posts":
      return getSellProductItems();
    case "buy_requests":
      return getBuyRequestItems();
    case "student_showcases":
      return getStudentShowcaseItems();
    case "market_research_reports":
      return getMarketResearchItems();
  }
}

export async function getPendingApprovalQueue(): Promise<ApprovalQueueSection[]> {
  return Promise.all(
    APPROVAL_SECTIONS.map(async (section) => ({
      ...section,
      items: await getSectionItems(section.targetTable),
    })),
  );
}
