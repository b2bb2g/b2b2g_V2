import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentApprovalStatus, ProductPublishStatus } from "@/types/database";

export type SupplierProductDraftListItem = {
  approvalStatus: ContentApprovalStatus;
  createdAt: string;
  id: string;
  publishStatus: ProductPublishStatus;
  summary: string | null;
  title: string;
  updatedAt: string;
  valuesCount: number;
};

export type SupplierProductDraftValue = {
  fieldKey: string;
  groupKey: string;
  publicDisplay: "hidden" | "summary" | "visible";
  sortOrder: number;
  valueText: string | null;
};

export type SupplierProductDraftDetail = SupplierProductDraftListItem & {
  description: string | null;
  values: SupplierProductDraftValue[];
};

async function getCurrentSupplierId() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("current_supplier_id");

  if (error || !data) {
    return { error: error?.message ?? "Supplier profile not found", supplierId: null, supabase };
  }

  return { error: null, supplierId: data, supabase };
}

export async function getMySupplierProductDrafts(): Promise<SupplierProductDraftListItem[]> {
  const { error, supplierId, supabase } = await getCurrentSupplierId();

  if (error || !supplierId) {
    return [];
  }

  const { data, error: productsError } = await supabase
    .from("products")
    .select("id,title,summary,approval_status,publish_status,created_at,updated_at")
    .eq("supplier_id", supplierId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (productsError || !data) {
    return [];
  }

  const productIds = data.map((product) => product.id);
  const valueCounts = new Map<string, number>();

  if (productIds.length > 0) {
    const { data: values } = await supabase
      .from("product_registration_values")
      .select("product_id")
      .in("product_id", productIds)
      .is("deleted_at", null);

    for (const value of values ?? []) {
      valueCounts.set(value.product_id, (valueCounts.get(value.product_id) ?? 0) + 1);
    }
  }

  return data.map((product) => ({
    approvalStatus: product.approval_status,
    createdAt: product.created_at,
    id: product.id,
    publishStatus: product.publish_status,
    summary: product.summary,
    title: product.title,
    updatedAt: product.updated_at,
    valuesCount: valueCounts.get(product.id) ?? 0,
  }));
}

export async function getMySupplierProductDraft(
  productId: string,
): Promise<SupplierProductDraftDetail | null> {
  const { error, supplierId, supabase } = await getCurrentSupplierId();

  if (error || !supplierId) {
    return null;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,title,summary,description,approval_status,publish_status,created_at,updated_at")
    .eq("id", productId)
    .eq("supplier_id", supplierId)
    .is("deleted_at", null)
    .maybeSingle();

  if (productError || !product) {
    return null;
  }

  const { data: values } = await supabase
    .from("product_registration_values")
    .select("field_key,group_key,public_display,sort_order,value_text")
    .eq("product_id", product.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return {
    approvalStatus: product.approval_status,
    createdAt: product.created_at,
    description: product.description,
    id: product.id,
    publishStatus: product.publish_status,
    summary: product.summary,
    title: product.title,
    updatedAt: product.updated_at,
    values: (values ?? []).map((value) => ({
      fieldKey: value.field_key,
      groupKey: value.group_key,
      publicDisplay: value.public_display,
      sortOrder: value.sort_order,
      valueText: value.value_text,
    })),
    valuesCount: values?.length ?? 0,
  };
}
