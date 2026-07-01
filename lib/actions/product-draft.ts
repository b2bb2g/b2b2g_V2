"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  initialProductDraftActionState,
  type ProductDraftActionState,
} from "@/lib/actions/product-draft-state";
import {
  PRODUCT_REGISTRATION_FIELD_TEMPLATE,
  type StaticProductRegistrationField,
} from "@/lib/products/static-products";

const MAX_TITLE_LENGTH = 160;
const MAX_VALUE_LENGTH = 1_200;
const ROOT_TITLE_FIELD = "product-name";
const ROOT_DESCRIPTION_FIELD = "application";
const FILE_UPLOAD_DISABLED_MESSAGE =
  "File upload is not enabled yet. Save text fields first; images and documents will open after Storage policy validation.";
const PRODUCT_DRAFT_ID_FIELD = "product-id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUIRED_REGISTRATION_FIELD_KEYS = PRODUCT_REGISTRATION_FIELD_TEMPLATE.filter(
  (field) => field.requirement === "required" && field.inputType !== "file",
).map((field) => field.id);

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalProductDraftId(formData: FormData): string | null {
  const value = getFormString(formData, PRODUCT_DRAFT_ID_FIELD);

  if (!value) {
    return null;
  }

  if (!UUID_PATTERN.test(value)) {
    throw new Error("Invalid product draft id");
  }

  return value;
}

function requireFormString(
  formData: FormData,
  key: string,
  label: string,
  maxLength = MAX_VALUE_LENGTH,
): string {
  const value = getFormString(formData, key);

  if (!value) {
    throw new Error(`${label} is required`);
  }

  if (value.length > maxLength) {
    throw new Error(`${label} is too long`);
  }

  return value;
}

function normalizeGroupKey(group: string): string {
  return group
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function assertNoEnabledFileUpload(formData: FormData) {
  const fileValue = formData.get("catalog-files");

  if (fileValue instanceof File && fileValue.size > 0) {
    throw new Error(FILE_UPLOAD_DISABLED_MESSAGE);
  }
}

function getSafeSummary(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();

  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function buildRegistrationValueRows(
  input: {
    formData: FormData;
    productId: string;
    userId: string;
  },
) {
  return PRODUCT_REGISTRATION_FIELD_TEMPLATE.flatMap((field, index) => {
    if (field.inputType === "file") {
      return [];
    }

    const value = getFormString(input.formData, field.id);

    if (!value) {
      return [];
    }

    if (value.length > MAX_VALUE_LENGTH) {
      throw new Error(`${field.label} is too long`);
    }

    return [
      {
        approval_status: "draft" as const,
        created_by: input.userId,
        field_key: field.id,
        group_key: normalizeGroupKey(field.group),
        product_id: input.productId,
        public_display: field.publicDisplay,
        sort_order: index,
        updated_by: input.userId,
        value_text: value,
      },
    ];
  });
}

type RegistrationValueRow = ReturnType<typeof buildRegistrationValueRows>[number];

function validateRequiredRegistrationFields(formData: FormData) {
  const requiredFields = PRODUCT_REGISTRATION_FIELD_TEMPLATE.filter(
    (field) => field.requirement === "required" && field.inputType !== "file",
  );

  for (const field of requiredFields) {
    requireFormString(
      formData,
      field.id,
      field.label,
      field.id === ROOT_TITLE_FIELD ? MAX_TITLE_LENGTH : MAX_VALUE_LENGTH,
    );
  }
}

function findTemplateField(fieldId: string): StaticProductRegistrationField | undefined {
  return PRODUCT_REGISTRATION_FIELD_TEMPLATE.find((field) => field.id === fieldId);
}

function getProductDraftId(formData: FormData): string {
  const productId = getOptionalProductDraftId(formData);

  if (!productId) {
    throw new Error("Product draft id is required");
  }

  return productId;
}

async function replaceProductRegistrationValues(input: {
  productId: string;
  rows: RegistrationValueRow[];
  supabase: SupabaseServerClient;
  userId: string;
}) {
  const { data: existingValues, error: existingError } = await input.supabase
    .from("product_registration_values")
    .select("id,field_key")
    .eq("product_id", input.productId)
    .is("deleted_at", null);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingByField = new Map(
    (existingValues ?? []).map((value) => [value.field_key, value.id]),
  );
  const incomingFields = new Set(input.rows.map((row) => row.field_key));
  const archivedIds = (existingValues ?? [])
    .filter((value) => !incomingFields.has(value.field_key))
    .map((value) => value.id);

  if (archivedIds.length > 0) {
    const { error: archiveError } = await input.supabase
      .from("product_registration_values")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: input.userId,
        updated_by: input.userId,
      })
      .in("id", archivedIds);

    if (archiveError) {
      throw new Error(archiveError.message);
    }
  }

  for (const row of input.rows) {
    const existingId = existingByField.get(row.field_key);

    if (existingId) {
      const { error: updateError } = await input.supabase
        .from("product_registration_values")
        .update({
          approval_status: "draft",
          group_key: row.group_key,
          public_display: row.public_display,
          sort_order: row.sort_order,
          updated_by: input.userId,
          value_text: row.value_text,
        })
        .eq("id", existingId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      continue;
    }

    const { error: insertError } = await input.supabase
      .from("product_registration_values")
      .insert(row);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return input.rows.length;
}

export async function saveSupplierProductDraft(
  _previousState: ProductDraftActionState,
  formData: FormData,
): Promise<ProductDraftActionState> {
  try {
    assertNoEnabledFileUpload(formData);
    validateRequiredRegistrationFields(formData);

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Sign in with an approved supplier account before saving a product draft");
    }

    const { data: supplierId, error: supplierIdError } =
      await supabase.rpc("current_supplier_id");

    if (supplierIdError || !supplierId) {
      throw new Error("Supplier profile is required before saving product drafts");
    }

    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .select("id,company_id,approval_status,is_active")
      .eq("id", supplierId)
      .maybeSingle();

    if (supplierError) {
      throw new Error(supplierError.message);
    }

    if (!supplier || supplier.approval_status !== "approved" || !supplier.is_active) {
      throw new Error("Approved supplier status is required before saving product drafts");
    }

    const productNameField = findTemplateField(ROOT_TITLE_FIELD);
    const applicationField = findTemplateField(ROOT_DESCRIPTION_FIELD);
    const title = requireFormString(
      formData,
      ROOT_TITLE_FIELD,
      productNameField?.label ?? "Product name",
      MAX_TITLE_LENGTH,
    );
    const description = requireFormString(
      formData,
      ROOT_DESCRIPTION_FIELD,
      applicationField?.label ?? "Usage / application",
    );

    const draftProductId = getOptionalProductDraftId(formData);
    let mode: ProductDraftActionState["mode"] = "created";
    let productId = draftProductId;

    if (draftProductId) {
      const { data: existingProduct, error: existingProductError } = await supabase
        .from("products")
        .select("id,approval_status,publish_status")
        .eq("id", draftProductId)
        .eq("supplier_id", supplier.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (existingProductError) {
        throw new Error(existingProductError.message);
      }

      if (!existingProduct) {
        throw new Error("Product draft was not found for this supplier account");
      }

      if (
        !["draft", "rejected"].includes(existingProduct.approval_status) ||
        existingProduct.publish_status !== "draft"
      ) {
        throw new Error("Only draft or rejected unpublished products can be edited");
      }

      const { error: updateProductError } = await supabase
        .from("products")
        .update({
          approval_status: "draft",
          description,
          publish_status: "draft",
          summary: getSafeSummary(description),
          title,
          updated_by: user.id,
        })
        .eq("id", existingProduct.id)
        .eq("supplier_id", supplier.id);

      if (updateProductError) {
        throw new Error(updateProductError.message);
      }

      productId = existingProduct.id;
      mode = "updated";
    } else {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          approval_status: "draft",
          company_id: supplier.company_id,
          created_by: user.id,
          description,
          publish_status: "draft",
          summary: getSafeSummary(description),
          supplier_id: supplier.id,
          title,
          updated_by: user.id,
        })
        .select("id")
        .single();

      if (productError || !product) {
        throw new Error(productError?.message ?? "Product draft could not be created");
      }

      productId = product.id;
    }

    if (!productId) {
      throw new Error("Product draft id could not be resolved");
    }

    const registrationRows = buildRegistrationValueRows({
      formData,
      productId,
      userId: user.id,
    });

    const valuesSaved =
      mode === "updated"
        ? await replaceProductRegistrationValues({
            productId,
            rows: registrationRows,
            supabase,
            userId: user.id,
          })
        : registrationRows.length;

    if (mode === "created" && registrationRows.length > 0) {
      const { error: valuesError } = await supabase
        .from("product_registration_values")
        .insert(registrationRows);

      if (valuesError) {
        return {
          error: `Product draft was created, but registration values could not be saved: ${valuesError.message}`,
          mode: null,
          ok: false,
          productId,
          valuesSaved: 0,
        };
      }
    }

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}`);
    revalidatePath(`/dashboard/products/${productId}/edit`);

    return {
      error: null,
      mode,
      ok: true,
      productId,
      valuesSaved,
    };
  } catch (error) {
    return {
      ...initialProductDraftActionState,
      error: error instanceof Error ? error.message : "Product draft save failed",
    };
  }
}

export async function submitSupplierProductDraftForReview(formData: FormData): Promise<never> {
  const productId = getProductDraftId(formData);
  let redirectTo = `/dashboard/products/${productId}?error=submit_failed`;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Sign in with an approved supplier account before submitting a product draft");
    }

    const { data: supplierId, error: supplierIdError } =
      await supabase.rpc("current_supplier_id");

    if (supplierIdError || !supplierId) {
      throw new Error("Supplier profile is required before submitting product drafts");
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id,approval_status,publish_status,supplier_id")
      .eq("id", productId)
      .eq("supplier_id", supplierId)
      .is("deleted_at", null)
      .maybeSingle();

    if (productError) {
      throw new Error(productError.message);
    }

    if (!product) {
      throw new Error("Product draft was not found for this supplier account");
    }

    if (!["draft", "rejected"].includes(product.approval_status)) {
      throw new Error("Only draft or rejected product drafts can be submitted for review");
    }

    if (product.publish_status !== "draft") {
      throw new Error("Only unpublished product drafts can be submitted for review");
    }

    const { data: values, error: valuesError } = await supabase
      .from("product_registration_values")
      .select("field_key,value_text")
      .eq("product_id", product.id)
      .is("deleted_at", null);

    if (valuesError) {
      throw new Error(valuesError.message);
    }

    const valueMap = new Map(
      (values ?? []).map((value) => [value.field_key, value.value_text?.trim() ?? ""]),
    );
    const missingRequiredFields = REQUIRED_REGISTRATION_FIELD_KEYS.filter(
      (fieldKey) => !valueMap.get(fieldKey),
    );

    if (missingRequiredFields.length > 0) {
      redirectTo = `/dashboard/products/${product.id}?error=missing_required`;
      throw new Error("Required product registration fields are missing");
    }

    const submittedAt = new Date().toISOString();
    const { error: updateProductError } = await supabase
      .from("products")
      .update({
        approval_status: "submitted",
        publish_status: "draft",
        submitted_at: submittedAt,
        updated_by: user.id,
      })
      .eq("id", product.id)
      .eq("supplier_id", supplierId);

    if (updateProductError) {
      throw new Error(updateProductError.message);
    }

    const { error: updateValuesError } = await supabase
      .from("product_registration_values")
      .update({
        approval_status: "submitted",
        updated_by: user.id,
      })
      .eq("product_id", product.id)
      .is("deleted_at", null);

    if (updateValuesError) {
      throw new Error(updateValuesError.message);
    }

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/dashboard/products/${product.id}/edit`);
    redirectTo = `/dashboard/products/${product.id}?result=submitted`;
  } catch {
    // The redirect target intentionally avoids leaking database or RLS error details.
  }

  redirect(redirectTo);
}
