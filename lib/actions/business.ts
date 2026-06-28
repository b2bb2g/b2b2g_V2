"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveRecord } from "@/lib/actions/admin-approval";
import { writeAuditEvent } from "@/lib/audit/logs";
import { requireCurrentUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateApplyEventInput,
  validateApproveMarketResearchReportInput,
  validateCreateBuyRequestInput,
  validateCreateBuySellPostInput,
  validateCreateEpcPostInput,
  validateCreateFdaApplicationInput,
  validateCreateIndustrialPostInput,
  validateCreateMarketResearchReportInput,
  validateCreateMatchingRequestInput,
  validateCreateProductInput,
  validateCreateStudentShowcaseInput,
  validateSendMessageInput,
  validateSubmitStudentShowcaseInput,
  type ApplyEventInput,
  type ApproveMarketResearchReportInput,
  type CreateBuyRequestInput,
  type CreateBuySellPostInput,
  type CreateEpcPostInput,
  type CreateFdaApplicationInput,
  type CreateIndustrialPostInput,
  type CreateMarketResearchReportInput,
  type CreateMatchingRequestInput,
  type CreateProductInput,
  type CreateStudentShowcaseInput,
  type SendMessageInput,
  type SubmitStudentShowcaseInput,
} from "@/lib/validators/business-actions";
import type { ActivityLogType } from "@/types/database";

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

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type MessageSupabase = Supabase | ReturnType<typeof createSupabaseAdminClient>;

type SendMessageErrorCode =
  | "blocked"
  | "conversation_not_found"
  | "not_member"
  | "send_failed";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Action failed";
}

async function getMessageSendAccess(
  supabase: MessageSupabase,
  conversationId: string,
  profileId: string,
): Promise<
  | {
      conversation: {
        deleted_at: string | null;
        id: string;
        is_active: boolean;
        is_blocked: boolean;
      };
      error: null;
      membership: {
        deleted_at: string | null;
        id: string;
        is_active: boolean;
      };
      ok: true;
    }
  | {
      error: SendMessageErrorCode;
      ok: false;
    }
> {
  const { data: membership, error: membershipError } = await supabase
    .from("conversation_members")
    .select("id,conversation_id,is_active,deleted_at")
    .eq("conversation_id", conversationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership || !membership.is_active || membership.deleted_at) {
    return { error: "not_member", ok: false };
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id,is_active,is_blocked,deleted_at")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversation || !conversation.is_active || conversation.deleted_at) {
    return { error: "conversation_not_found", ok: false };
  }

  if (conversation.is_blocked) {
    return { error: "blocked", ok: false };
  }

  return {
    conversation,
    error: null,
    membership,
    ok: true,
  };
}

async function writeMessageFailureAudit(
  supabase: MessageSupabase,
  input: {
    conversationId: string;
    errorMessage: string;
    profileId: string;
  },
) {
  try {
    await writeAuditEvent(supabase, {
      actorProfileId: input.profileId,
      errorCode: "message_insert_failed",
      eventLevel: "system",
      eventType: "rls_blocked",
      message: input.errorMessage,
      severity: "warning",
      targetId: input.conversationId,
      targetTable: "messages",
    });
  } catch {
    // Audit failure must not hide the message send result from the user.
  }
}

async function getCurrentSupplierContext(supabase: Supabase) {
  const { data: supplierId, error } = await supabase.rpc("current_supplier_id");

  if (error || !supplierId) {
    throw new Error("Approved supplier account required");
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id,company_id")
    .eq("id", supplierId)
    .maybeSingle();

  if (supplierError) {
    throw new Error(supplierError.message);
  }

  if (!supplier) {
    throw new Error("Supplier profile not found");
  }

  return supplier;
}

async function getCurrentBuyerId(supabase: Supabase): Promise<string> {
  const { data, error } = await supabase.rpc("current_buyer_id");

  if (error || !data) {
    throw new Error("Approved buyer account required");
  }

  return data;
}

async function getCurrentStudentId(supabase: Supabase): Promise<string> {
  const { data, error } = await supabase.rpc("current_student_id");

  if (error || !data) {
    throw new Error("Student account required");
  }

  return data;
}

function getOptionalText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function getRequiredText(formData: FormData, key: string, maxLength: number): string {
  const value = getOptionalText(formData, key, maxLength);

  if (!value) {
    throw new Error("Required field is missing");
  }

  return value;
}

function getOptionalUuid(formData: FormData, key: string): string | null {
  const value = getOptionalText(formData, key, 80);

  if (!value) {
    return null;
  }

  if (!UUID_PATTERN.test(value)) {
    throw new Error("Invalid identifier");
  }

  return value;
}

function getRequiredUuid(formData: FormData, key: string): string {
  const value = getOptionalUuid(formData, key);

  if (!value) {
    throw new Error("Required identifier is missing");
  }

  return value;
}

async function writeActivityLog(
  supabase: Supabase,
  input: {
    activityType: ActivityLogType;
    actorProfileId: string;
    profileId: string;
    summary?: string | null;
    targetId?: string | null;
    targetTable?: string | null;
  },
) {
  const { error } = await supabase.from("activity_logs").insert({
    activity_type: input.activityType,
    actor_profile_id: input.actorProfileId,
    created_by: input.actorProfileId,
    metadata: {},
    profile_id: input.profileId,
    summary: input.summary ?? null,
    target_id: input.targetId ?? null,
    target_table: input.targetTable ?? null,
  });

  if (error) {
    await writeAuditEvent(supabase, {
      actorProfileId: input.actorProfileId,
      errorCode: "activity_log_insert_failed",
      eventLevel: "system",
      eventType: "system_change",
      message: error.message,
      severity: "warning",
      targetId: input.targetId,
      targetTable: input.targetTable,
    });
  }
}

export async function updateDashboardCompanyProfile(formData: FormData) {
  let redirectPath = "/dashboard/company?result=updated";

  try {
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const memberType = getRequiredText(formData, "memberType", 32);

    if (memberType === "supplier") {
      const supplier = await getCurrentSupplierContext(supabase);
      if (!supplier.company_id) {
        throw new Error("Supplier company is not assigned");
      }

      const companyName = getRequiredText(formData, "companyName", 160);
      const companyTypeId = getRequiredUuid(formData, "companyTypeId");
      const countryId = getRequiredUuid(formData, "countryId");
      const industryId = getRequiredUuid(formData, "industryId");
      const website = getOptionalText(formData, "website", 240);
      const description = getOptionalText(formData, "description", 800);

      const { error } = await supabase
        .from("companies")
        .update({
          company_type_id: companyTypeId,
          country_id: countryId,
          description,
          industry_id: industryId,
          name: companyName,
          updated_by: user.id,
          website,
        })
        .eq("id", supplier.company_id);

      if (error) {
        throw new Error(error.message);
      }

      await writeActivityLog(supabase, {
        activityType: "profile_updated",
        actorProfileId: user.id,
        profileId: user.id,
        summary: companyName,
        targetId: supplier.company_id,
        targetTable: "companies",
      });
    } else if (memberType === "buyer") {
      const buyerId = await getCurrentBuyerId(supabase);
      const companyName = getRequiredText(formData, "companyName", 160);
      const countryId = getOptionalUuid(formData, "countryId");

      const { error } = await supabase
        .from("buyers")
        .update({
          company_name: companyName,
          country_id: countryId,
          updated_by: user.id,
        })
        .eq("id", buyerId);

      if (error) {
        throw new Error(error.message);
      }

      await writeActivityLog(supabase, {
        activityType: "profile_updated",
        actorProfileId: user.id,
        profileId: user.id,
        summary: companyName,
        targetId: buyerId,
        targetTable: "buyers",
      });
    } else if (memberType === "professor") {
      const { data: professorId, error: professorIdError } =
        await supabase.rpc("current_professor_id");

      if (professorIdError || !professorId) {
        throw new Error("Professor account required");
      }

      const universityName = getRequiredText(formData, "universityName", 180);
      const { error } = await supabase
        .from("professors")
        .update({
          university_name: universityName,
          updated_by: user.id,
        })
        .eq("id", professorId);

      if (error) {
        throw new Error(error.message);
      }

      await writeActivityLog(supabase, {
        activityType: "profile_updated",
        actorProfileId: user.id,
        profileId: user.id,
        summary: universityName,
        targetId: professorId,
        targetTable: "professors",
      });
    } else if (memberType === "student") {
      const studentId = await getCurrentStudentId(supabase);
      const universityName = getRequiredText(formData, "universityName", 180);
      const { error } = await supabase
        .from("students")
        .update({
          university_name: universityName,
          updated_by: user.id,
        })
        .eq("id", studentId);

      if (error) {
        throw new Error(error.message);
      }

      await writeActivityLog(supabase, {
        activityType: "profile_updated",
        actorProfileId: user.id,
        profileId: user.id,
        summary: universityName,
        targetId: studentId,
        targetTable: "students",
      });
    } else {
      throw new Error("Unsupported member type");
    }

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard");
  } catch {
    redirectPath = "/dashboard/company?error=update_failed";
  }

  redirect(redirectPath);
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateProductInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const supplier = await getCurrentSupplierContext(supabase);

    const { data, error } = await supabase
      .from("products")
      .insert({
        approval_status: "submitted",
        category_id: validatedInput.categoryId,
        company_id: supplier.company_id,
        created_by: user.id,
        description: validatedInput.description,
        industry_id: validatedInput.industryId,
        main_file_id: validatedInput.mainFileId,
        supplier_id: supplier.id,
        summary: validatedInput.summary,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "product_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "products",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createIndustrialPost(
  input: CreateIndustrialPostInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateIndustrialPostInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const supplier = await getCurrentSupplierContext(supabase);

    const { data, error } = await supabase
      .from("industrial_posts")
      .insert({
        approval_status: "submitted",
        category_id: validatedInput.categoryId,
        company_id: supplier.company_id,
        created_by: user.id,
        description: validatedInput.description,
        industry_id: validatedInput.industryId,
        supplier_id: supplier.id,
        summary: validatedInput.summary,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "product_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "industrial_posts",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createEpcPost(input: CreateEpcPostInput): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateEpcPostInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const supplier = await getCurrentSupplierContext(supabase);

    const { data, error } = await supabase
      .from("epc_posts")
      .insert({
        approval_status: "submitted",
        category_id: validatedInput.categoryId,
        company_id: supplier.company_id,
        created_by: user.id,
        description: validatedInput.description,
        industry_id: validatedInput.industryId,
        project_country_id: validatedInput.projectCountryId,
        project_scope: validatedInput.projectScope,
        supplier_id: supplier.id,
        summary: validatedInput.summary,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "product_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "epc_posts",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createBuySellPost(
  input: CreateBuySellPostInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateBuySellPostInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const supplier = await getCurrentSupplierContext(supabase);

    const { data, error } = await supabase
      .from("buy_sell_posts")
      .insert({
        approval_status: "submitted",
        author_profile_id: user.id,
        category_id: validatedInput.categoryId,
        created_by: user.id,
        description: validatedInput.description,
        post_type: "sell_product",
        supplier_id: supplier.id,
        target_country_id: validatedInput.targetCountryId,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "product_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "buy_sell_posts",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createBuyRequest(
  input: CreateBuyRequestInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateBuyRequestInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const buyerId = await getCurrentBuyerId(supabase);

    const { data, error } = await supabase
      .from("buy_requests")
      .insert({
        approval_status: "submitted",
        buyer_id: buyerId,
        category_id: validatedInput.categoryId,
        created_by: user.id,
        destination_country_id: validatedInput.destinationCountryId,
        details: validatedInput.details,
        industry_id: validatedInput.industryId,
        quantity: validatedInput.quantity,
        target_price: validatedInput.targetPrice,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "matching_requested",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "buy_requests",
    });

    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createMatchingRequest(
  input: CreateMatchingRequestInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateMatchingRequestInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("matching_requests")
      .insert({
        created_by: user.id,
        matching_type: validatedInput.matchingType,
        requester_profile_id: user.id,
        status: "requested",
        target_profile_id: validatedInput.targetProfileId,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "matching_requested",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.matchingType,
      targetId: data.id,
      targetTable: "matching_requests",
    });

    revalidatePath("/dashboard/activities");
    revalidatePath("/admin");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createStudentShowcase(
  input: CreateStudentShowcaseInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateStudentShowcaseInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const studentId = await getCurrentStudentId(supabase);

    const { data: showcase, error } = await supabase
      .from("student_showcases")
      .insert({
        approval_status: "draft",
        created_by: user.id,
        description: validatedInput.description,
        student_id: studentId,
        target_country_id: validatedInput.targetCountryId,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (validatedInput.items?.length) {
      const { error: itemError } = await supabase.from("student_showcase_items").insert(
        validatedInput.items.map((item) => ({
          created_by: user.id,
          display_order: item.displayOrder,
          product_id: item.productId,
          showcase_id: showcase.id,
          student_note: item.studentNote,
          updated_by: user.id,
        })),
      );

      if (itemError) {
        throw new Error(itemError.message);
      }
    }

    await writeActivityLog(supabase, {
      activityType: "showcase_created",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: showcase.id,
      targetTable: "student_showcases",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: showcase.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function submitStudentShowcase(
  input: SubmitStudentShowcaseInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateSubmitStudentShowcaseInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const studentId = await getCurrentStudentId(supabase);

    const { data, error } = await supabase
      .from("student_showcases")
      .update({
        approval_status: "submitted",
        updated_by: user.id,
      })
      .eq("id", validatedInput.showcaseId)
      .eq("student_id", studentId)
      .select("id,title")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Showcase not found");
    }

    await writeActivityLog(supabase, {
      activityType: "showcase_created",
      actorProfileId: user.id,
      profileId: user.id,
      summary: data.title,
      targetId: data.id,
      targetTable: "student_showcases",
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function createDashboardStudentShowcase(formData: FormData): Promise<never> {
  let redirectTo = "/dashboard/products?error=showcase_create_failed";

  try {
    const productId = getRequiredUuid(formData, "productId");
    const studentNote = getOptionalText(formData, "studentNote", 600) ?? undefined;
    const result = await createStudentShowcase({
      description: getOptionalText(formData, "description", 1200) ?? undefined,
      items: [
        {
          displayOrder: 1,
          productId,
          studentNote,
        },
      ],
      targetCountryId: null,
      title: getRequiredText(formData, "title", 160),
    });

    if (result.ok) {
      redirectTo = "/dashboard/products?result=showcase_created";
    }
  } catch {
    redirectTo = "/dashboard/products?error=showcase_create_failed";
  }

  redirect(redirectTo);
}

export async function submitDashboardStudentShowcase(formData: FormData): Promise<never> {
  let redirectTo = "/dashboard/products?error=showcase_submit_failed";

  try {
    const result = await submitStudentShowcase({
      showcaseId: getRequiredUuid(formData, "showcaseId"),
    });

    if (result.ok) {
      redirectTo = "/dashboard/products?result=showcase_submitted";
    }
  } catch {
    redirectTo = "/dashboard/products?error=showcase_submit_failed";
  }

  redirect(redirectTo);
}

export async function approveStudentShowcase(
  input: SubmitStudentShowcaseInput,
): Promise<ActionResult> {
  return approveRecord({
    targetId: validateSubmitStudentShowcaseInput(input).showcaseId,
    targetTable: "student_showcases",
  });
}

export async function createMarketResearchReport(
  input: CreateMarketResearchReportInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateMarketResearchReportInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const studentId = await getCurrentStudentId(supabase);

    const { data, error } = await supabase
      .from("market_research_reports")
      .insert({
        approval_status: "submitted",
        content: validatedInput.content,
        country_id: validatedInput.countryId,
        created_by: user.id,
        industry_id: validatedInput.industryId,
        student_id: studentId,
        summary: validatedInput.summary,
        title: validatedInput.title,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "market_research_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.title,
      targetId: data.id,
      targetTable: "market_research_reports",
    });

    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/content");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function approveMarketResearchReport(
  input: ApproveMarketResearchReportInput,
): Promise<ActionResult> {
  return approveRecord({
    targetId: validateApproveMarketResearchReportInput(input).reportId,
    targetTable: "market_research_reports",
  });
}

export async function createFdaApplication(
  input: CreateFdaApplicationInput,
): Promise<ActionResult> {
  try {
    const validatedInput = validateCreateFdaApplicationInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const supplier = await getCurrentSupplierContext(supabase);
    const now = new Date().toISOString();
    const status = validatedInput.submit ? "submitted" : "draft";

    const { data, error } = await supabase
      .from("thailand_fda_applications")
      .insert({
        created_by: user.id,
        formula_summary: validatedInput.formulaSummary,
        product_name: validatedInput.productName,
        service_category: validatedInput.serviceCategory,
        status,
        submitted_at: status === "submitted" ? now : null,
        supplier_id: supplier.id,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "fda_application_submitted",
      actorProfileId: user.id,
      profileId: user.id,
      summary: validatedInput.productName,
      targetId: data.id,
      targetTable: "thailand_fda_applications",
    });

    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/fda");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function applyEvent(input: ApplyEventInput): Promise<ActionResult> {
  try {
    const validatedInput = validateApplyEventInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("event_applications")
      .upsert(
        {
          created_by: user.id,
          event_id: validatedInput.eventId,
          note: validatedInput.note,
          profile_id: user.id,
          status: "submitted",
          updated_by: user.id,
        },
        { onConflict: "event_id,profile_id" },
      )
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await writeActivityLog(supabase, {
      activityType: "event_applied",
      actorProfileId: user.id,
      profileId: user.id,
      targetId: data.id,
      targetTable: "event_applications",
    });

    revalidatePath("/dashboard/activities");
    revalidatePath("/admin/events");

    return { error: null, ok: true, recordId: data.id };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function sendMessage(input: SendMessageInput): Promise<ActionResult> {
  try {
    const validatedInput = validateSendMessageInput(input);
    const user = await requireCurrentUser();
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const access = await getMessageSendAccess(
      supabase,
      validatedInput.conversationId,
      user.id,
    );

    if (!access.ok) {
      return { error: access.error, ok: false };
    }

    const messagePayload = {
      body: validatedInput.body,
      conversation_id: validatedInput.conversationId,
      created_by: user.id,
      sender_profile_id: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(messagePayload)
      .select("id")
      .single();

    let recordId = data?.id ?? null;
    let writeSupabase: MessageSupabase = supabase;
    let membershipId = access.membership.id;

    if (error) {
      let adminSupabase: ReturnType<typeof createSupabaseAdminClient> | null = null;

      try {
        adminSupabase = createSupabaseAdminClient();
      } catch {
        await writeMessageFailureAudit(supabase, {
          conversationId: validatedInput.conversationId,
          errorMessage: error.message,
          profileId: user.id,
        });

        return { error: "send_failed", ok: false };
      }

      const adminAccess = await getMessageSendAccess(
        adminSupabase,
        validatedInput.conversationId,
        user.id,
      );

      if (!adminAccess.ok) {
        await writeMessageFailureAudit(adminSupabase, {
          conversationId: validatedInput.conversationId,
          errorMessage: error.message,
          profileId: user.id,
        });

        return { error: adminAccess.error, ok: false };
      }

      const fallbackResult = await adminSupabase
        .from("messages")
        .insert(messagePayload)
        .select("id")
        .single();

      if (fallbackResult.error) {
        await writeMessageFailureAudit(adminSupabase, {
          conversationId: validatedInput.conversationId,
          errorMessage: fallbackResult.error.message,
          profileId: user.id,
        });

        return { error: "send_failed", ok: false };
      }

      recordId = fallbackResult.data.id;
      writeSupabase = adminSupabase;
      membershipId = adminAccess.membership.id;
    }

    if (!recordId) {
      return { error: "send_failed", ok: false };
    }

    await writeSupabase
      .from("conversation_members")
      .update({
        last_read_at: now,
        updated_by: user.id,
      })
      .eq("id", membershipId);

    await writeSupabase
      .from("conversations")
      .update({
        updated_by: user.id,
      })
      .eq("id", validatedInput.conversationId);

    revalidatePath("/dashboard/messages");
    revalidatePath("/admin/messages");

    return { error: null, ok: true, recordId };
  } catch (error) {
    return { error: getErrorMessage(error), ok: false };
  }
}

export async function sendDashboardMessage(formData: FormData): Promise<void> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "");
  const encodedConversationId = encodeURIComponent(conversationId);
  const result = await sendMessage({ body, conversationId });

  if (!result.ok) {
    const errorCode = normalizeSendMessageErrorCode(result.error);
    redirect(`/dashboard/messages?conversation=${encodedConversationId}&error=${errorCode}`);
  }

  redirect(`/dashboard/messages?conversation=${encodedConversationId}&result=sent`);
}

function normalizeSendMessageErrorCode(error: string): SendMessageErrorCode {
  if (
    error === "blocked" ||
    error === "conversation_not_found" ||
    error === "not_member" ||
    error === "send_failed"
  ) {
    return error;
  }

  if (error === "Required field is missing") {
    return "send_failed";
  }

  return "send_failed";
}
