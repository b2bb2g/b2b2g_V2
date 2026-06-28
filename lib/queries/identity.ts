import "server-only";
import { requireAdminRoute } from "@/lib/auth/guards";
import { requireCurrentUser } from "@/lib/auth/session";
import { normalizeRoleKey } from "@/lib/auth/account-roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountRoleStatus, Database, RoleApplicationStatus } from "@/types/database";

type Tables = Database["public"]["Tables"];

export type AccountRoleRecord = Pick<
  Tables["account_roles"]["Row"],
  "account_id" | "approved_at" | "created_at" | "deleted_at" | "id" | "role_key" | "status" | "updated_at"
>;

export type RoleApplicationRecord = Pick<
  Tables["role_applications"]["Row"],
  | "account_id"
  | "created_at"
  | "deleted_at"
  | "id"
  | "reason"
  | "rejection_reason"
  | "requested_role_key"
  | "reviewed_at"
  | "status"
  | "updated_at"
>;
export type AdminRoleApplicationRecord = Pick<
  Tables["role_applications"]["Row"],
  | "account_id"
  | "created_at"
  | "id"
  | "reason"
  | "requested_role_key"
  | "reviewed_at"
  | "status"
  | "updated_at"
>;

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const ACCOUNT_ROLE_SELECT =
  "id,account_id,role_key,status,approved_at,created_at,updated_at,deleted_at";
const ROLE_APPLICATION_SELECT =
  "id,account_id,requested_role_key,status,reason,reviewed_at,rejection_reason,created_at,updated_at,deleted_at";
const ADMIN_ROLE_APPLICATION_SELECT =
  "id,account_id,requested_role_key,status,reason,created_at,reviewed_at,updated_at";
const ACTIVE_ROLE_STATUSES: AccountRoleStatus[] = ["active", "approved"];
const OPEN_APPLICATION_STATUSES: RoleApplicationStatus[] = [
  "submitted",
  "requested",
  "under_review",
];

async function canReadAccountIdentity(supabase: Supabase, accountId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  if (user.id === accountId) {
    return true;
  }

  const { data } = await supabase.rpc("is_admin");

  return Boolean(data);
}

async function assertCanReadAccountIdentity(
  supabase: Supabase,
  accountId: string,
): Promise<void> {
  const canRead = await canReadAccountIdentity(supabase, accountId);

  if (!canRead) {
    throw new Error("Permission denied");
  }
}

export async function getAccountRoles(accountId: string): Promise<AccountRoleRecord[]> {
  const supabase = await createSupabaseServerClient();
  await assertCanReadAccountIdentity(supabase, accountId);

  const { data, error } = await supabase
    .from("account_roles")
    .select(ACCOUNT_ROLE_SELECT)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMyAccountRoles(): Promise<AccountRoleRecord[]> {
  const user = await requireCurrentUser();

  return getAccountRoles(user.id);
}

export async function hasAccountRole(
  accountId: string,
  roleKey: string,
): Promise<boolean> {
  const normalizedRoleKey = normalizeRoleKey(roleKey);

  if (!normalizedRoleKey) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  await assertCanReadAccountIdentity(supabase, accountId);

  const { data, error } = await supabase
    .from("account_roles")
    .select("id")
    .eq("account_id", accountId)
    .eq("role_key", normalizedRoleKey)
    .in("status", ACTIVE_ROLE_STATUSES)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

export async function getRoleApplications(
  accountId: string,
): Promise<RoleApplicationRecord[]> {
  const supabase = await createSupabaseServerClient();
  await assertCanReadAccountIdentity(supabase, accountId);

  const { data, error } = await supabase
    .from("role_applications")
    .select(ROLE_APPLICATION_SELECT)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMyRoleApplications(): Promise<RoleApplicationRecord[]> {
  const user = await requireCurrentUser();

  return getRoleApplications(user.id);
}

export async function getPendingRoleApplicationsForAdmin(): Promise<
  AdminRoleApplicationRecord[]
> {
  await requireAdminRoute();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("role_applications")
    .select(ADMIN_ROLE_APPLICATION_SELECT)
    .in("status", ["submitted", "under_review"])
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function hasOpenRoleApplication(input: {
  accountId: string;
  roleKey: string;
}): Promise<boolean> {
  const normalizedRoleKey = normalizeRoleKey(input.roleKey);

  if (!normalizedRoleKey) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  await assertCanReadAccountIdentity(supabase, input.accountId);

  const { data, error } = await supabase
    .from("role_applications")
    .select("id")
    .eq("account_id", input.accountId)
    .eq("requested_role_key", normalizedRoleKey)
    .in("status", OPEN_APPLICATION_STATUSES)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}
