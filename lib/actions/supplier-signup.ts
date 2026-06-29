"use server";

import { requestRole } from "@/lib/actions/identity";

export type SupplierSignupSubmitState = {
  error: string | null;
  ok: boolean;
  recordId: string | null;
};

const MAX_FIELD_LENGTH = 160;
const MAX_PRODUCT_SUMMARY_LENGTH = 500;
const initialState: SupplierSignupSubmitState = {
  error: null,
  ok: false,
  recordId: null,
};

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function requireFormString(
  formData: FormData,
  key: string,
  label: string,
  maxLength = MAX_FIELD_LENGTH,
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

function normalizeOptionalUrl(formData: FormData): string {
  const value = getFormString(formData, "website_or_catalog_url");

  if (!value) {
    return "Not provided";
  }

  if (value.length > 300) {
    throw new Error("Website or catalog URL is too long");
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }

    return url.toString();
  } catch {
    throw new Error("Website or catalog URL must be a valid http or https URL");
  }
}

function assertTermsAccepted(formData: FormData) {
  if (getFormString(formData, "terms_agreed") !== "yes") {
    throw new Error("Terms agreement is required");
  }
}

function buildSupplierApplicationReason(formData: FormData): string {
  assertTermsAccepted(formData);

  requireFormString(formData, "contact_email", "Contact email", 320);
  requireFormString(formData, "contact_name", "Contact name");

  const companyName = requireFormString(formData, "company_name", "Company name");
  const country = requireFormString(formData, "country", "Country");
  const productCategory = requireFormString(
    formData,
    "product_category",
    "Product category",
  );
  const productSummary = requireFormString(
    formData,
    "product_summary",
    "Product summary",
    MAX_PRODUCT_SUMMARY_LENGTH,
  );
  const websiteOrCatalogUrl = normalizeOptionalUrl(formData);
  const invitationToken = getFormString(formData, "invitation_token");
  const invitationStatus = invitationToken ? "provided" : "none";

  return [
    "Supplier application",
    `Company: ${companyName}`,
    `Country: ${country}`,
    `Category: ${productCategory}`,
    `Product summary: ${productSummary}`,
    `Website: ${websiteOrCatalogUrl}`,
    `Invitation: ${invitationStatus}`,
  ].join("\n");
}

export async function submitSupplierRoleApplication(
  _previousState: SupplierSignupSubmitState,
  formData: FormData,
): Promise<SupplierSignupSubmitState> {
  try {
    const reason = buildSupplierApplicationReason(formData);
    const result = await requestRole("supplier", reason);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      error: null,
      ok: true,
      recordId: result.recordId,
    };
  } catch (error) {
    return {
      ...initialState,
      error: error instanceof Error ? error.message : "Supplier application failed",
    };
  }
}
