"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveRecord, rejectRecord } from "@/lib/actions/admin-approval";
import { suspendCompany, verifyCompany } from "@/lib/actions/admin-management";

type CompanyActionResult =
  | "approved"
  | "error"
  | "rejected"
  | "suspended"
  | "verified";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function redirectToCompanies(result: CompanyActionResult): never {
  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  redirect(`/admin/companies?result=${result}`);
}

export async function approveCompanyAction(formData: FormData): Promise<void> {
  const result = await approveRecord({
    reason: getFormString(formData, "reason"),
    targetId: getFormString(formData, "companyId"),
    targetTable: "companies",
  });

  redirectToCompanies(result.ok ? "approved" : "error");
}

export async function rejectCompanyAction(formData: FormData): Promise<void> {
  const result = await rejectRecord({
    reason: getFormString(formData, "reason"),
    targetId: getFormString(formData, "companyId"),
    targetTable: "companies",
  });

  redirectToCompanies(result.ok ? "rejected" : "error");
}

export async function verifyCompanyAction(formData: FormData): Promise<void> {
  const result = await verifyCompany({
    businessRegistrationChecked: formData.has("businessRegistrationChecked"),
    catalogChecked: formData.has("catalogChecked"),
    certificateChecked: formData.has("certificateChecked"),
    companyId: getFormString(formData, "companyId"),
    reviewNote: getFormString(formData, "reviewNote"),
    websiteChecked: formData.has("websiteChecked"),
  });

  redirectToCompanies(result.ok ? "verified" : "error");
}

export async function suspendCompanyAction(formData: FormData): Promise<void> {
  const result = await suspendCompany({
    companyId: getFormString(formData, "companyId"),
    reason: getFormString(formData, "reason"),
  });

  redirectToCompanies(result.ok ? "suspended" : "error");
}
