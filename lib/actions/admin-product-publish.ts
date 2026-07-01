"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminLog, writeAuditEvent } from "@/lib/audit/logs";
import { requireCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionResult =
  | {
      error: null;
      ok: true;
      recordId: string;
    }
  | {
      error: string;
      ok: false;
    };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Action failed";
}

async function hasProductPublishPermission(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<boolean> {
  const [approvePermission, managePermission] = await Promise.all([
    supabase.rpc("has_permission", { permission_code: "content.approve" }),
    supabase.rpc("has_permission", { permission_code: "content.manage" }),
  ]);

  return Boolean(approvePermission.data || managePermission.data);
}

export async function publishApprovedProduct(productId: string): Promise<ActionResult> {
  try {
    if (!UUID_PATTERN.test(productId)) {
      throw new Error("Invalid product id");
    }

    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const hasPermission = await hasProductPublishPermission(supabase);

    if (!hasPermission) {
      await writeAuditEvent(supabase, {
        actorProfileId: user.id,
        errorCode: "product_publish_permission_denied",
        eventLevel: "security",
        eventType: "unauthorized_access",
        message: "Product publish action denied by permission guard",
        severity: "warning",
        targetId: productId,
        targetTable: "products",
      });

      throw new Error("Permission denied");
    }

    const { data: beforeData, error: beforeError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("approval_status", "approved")
      .neq("publish_status", "published")
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (beforeError) {
      throw new Error(beforeError.message);
    }

    if (!beforeData) {
      throw new Error("Approved unpublished product not found");
    }

    if (!beforeData.summary?.trim()) {
      throw new Error("Product summary is required before publish");
    }

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("id,approval_status,is_active,deleted_at")
      .eq("id", beforeData.company_id)
      .maybeSingle();

    if (companyError) {
      throw new Error(companyError.message);
    }

    if (
      !companyData ||
      companyData.approval_status !== "approved" ||
      !companyData.is_active ||
      companyData.deleted_at
    ) {
      throw new Error("Approved active company is required before product publish");
    }

    const now = new Date().toISOString();
    const { data: afterData, error: updateError } = await supabase
      .from("products")
      .update({
        publish_status: "published",
        published_at: now,
        updated_by: user.id,
      })
      .eq("id", productId)
      .eq("approval_status", "approved")
      .neq("publish_status", "published")
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!afterData) {
      throw new Error("Product publish update failed");
    }

    const logResult = await writeAdminLog(supabase, {
      action: "manual",
      actorProfileId: user.id,
      afterData,
      beforeData,
      reason: "Product published from Admin content workflow",
      targetId: productId,
      targetLabel: afterData.title,
      targetTable: "products",
    });

    if (!logResult.ok) {
      throw new Error(`Product published but audit log failed: ${logResult.error}`);
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/commercial");
    revalidatePath("/admin");
    revalidatePath("/admin/content");

    return {
      error: null,
      ok: true,
      recordId: productId,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false,
    };
  }
}

export async function publishApprovedProductAction(formData: FormData): Promise<void> {
  const result = await publishApprovedProduct(getFormString(formData, "productId"));

  redirect(`/admin/content?result=${result.ok ? "published" : "error"}`);
}
