"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PRODUCT_REGISTRATION_FIELD_TEMPLATE,
  type StaticProductRegistrationField,
} from "@/lib/products/static-products";

export type ProductDraftActionState = {
  error: string | null;
  ok: boolean;
  productId: string | null;
  valuesSaved: number;
};

export const initialProductDraftActionState: ProductDraftActionState = {
  error: null,
  ok: false,
  productId: null,
  valuesSaved: 0,
};

const MAX_TITLE_LENGTH = 160;
const MAX_VALUE_LENGTH = 1_200;
const ROOT_TITLE_FIELD = "product-name";
const ROOT_DESCRIPTION_FIELD = "application";
const FILE_UPLOAD_DISABLED_MESSAGE =
  "File upload is not enabled yet. Save text fields first; images and documents will open after Storage policy validation.";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
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

    const registrationRows = buildRegistrationValueRows({
      formData,
      productId: product.id,
      userId: user.id,
    });

    if (registrationRows.length > 0) {
      const { error: valuesError } = await supabase
        .from("product_registration_values")
        .insert(registrationRows);

      if (valuesError) {
        return {
          error: `Product draft was created, but registration values could not be saved: ${valuesError.message}`,
          ok: false,
          productId: product.id,
          valuesSaved: 0,
        };
      }
    }

    revalidatePath("/dashboard/products");

    return {
      error: null,
      ok: true,
      productId: product.id,
      valuesSaved: registrationRows.length,
    };
  } catch (error) {
    return {
      ...initialProductDraftActionState,
      error: error instanceof Error ? error.message : "Product draft save failed",
    };
  }
}
