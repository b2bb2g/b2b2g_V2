"use server";

import { requestRole } from "@/lib/actions/identity";

export type AgentSignupSubmitState = {
  error: string | null;
  ok: boolean;
  recordId: string | null;
};

const MAX_FIELD_LENGTH = 160;
const MAX_SUMMARY_LENGTH = 600;
const initialState: AgentSignupSubmitState = {
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
  const value = getFormString(formData, "website_or_profile_url");

  if (!value) {
    return "Not provided";
  }

  if (value.length > 300) {
    throw new Error("Website / profile URL is too long");
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }

    return url.toString();
  } catch {
    throw new Error("Website / profile URL must be a valid http or https URL");
  }
}

function assertTermsAccepted(formData: FormData) {
  if (getFormString(formData, "terms_agreed") !== "yes") {
    throw new Error("Terms agreement is required");
  }
}

function buildAgentApplicationReason(formData: FormData): string {
  assertTermsAccepted(formData);

  requireFormString(formData, "contact_email", "Contact email", 320);
  requireFormString(formData, "contact_name", "Contact name");

  const countryMarket = requireFormString(
    formData,
    "country_market",
    "Country / Market",
  );
  const organization = requireFormString(
    formData,
    "organization_name",
    "Company or organization name",
  );
  const experienceSummary = requireFormString(
    formData,
    "experience_summary",
    "Experience summary",
    MAX_SUMMARY_LENGTH,
  );
  const targetBuyerMarket = requireFormString(
    formData,
    "target_buyer_market",
    "Target buyer market",
    MAX_SUMMARY_LENGTH,
  );
  const websiteOrProfileUrl = normalizeOptionalUrl(formData);
  const invitationToken = getFormString(formData, "invitation_token");
  const invitationStatus = invitationToken ? "provided" : "none";

  return [
    "Agent application",
    `Country / Market: ${countryMarket}`,
    `Organization: ${organization}`,
    `Experience summary: ${experienceSummary}`,
    `Target buyer market: ${targetBuyerMarket}`,
    `Website/Profile: ${websiteOrProfileUrl}`,
    `Invitation: ${invitationStatus}`,
  ].join("\n");
}

export async function submitAgentRoleApplication(
  _previousState: AgentSignupSubmitState,
  formData: FormData,
): Promise<AgentSignupSubmitState> {
  try {
    const reason = buildAgentApplicationReason(formData);
    const result = await requestRole("agent", reason);

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
      error: error instanceof Error ? error.message : "Agent application failed",
    };
  }
}
