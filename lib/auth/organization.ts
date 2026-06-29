export type OrganizationRole = "admin" | "manager" | "member" | "owner" | "viewer";

export type OrganizationMembership = {
  companyId: string;
  deletedAt?: string | null;
  endedAt?: string | null;
  role: string;
  status: string;
  userId: string;
};

export type AgentBuyerRelation = {
  agentId: string;
  buyerId: string;
  deletedAt?: string | null;
  endedAt?: string | null;
  status: string;
};

export type ProfessorStudentRelation = {
  deletedAt?: string | null;
  endedAt?: string | null;
  professorId: string;
  status: string;
  studentId: string;
};

const ACTIVE_RELATION_STATUSES = new Set(["active"]);
const COMPANY_MANAGEMENT_ROLES = new Set<OrganizationRole>(["admin", "manager", "owner"]);
const ORGANIZATION_ROLE_ALIASES: Record<string, OrganizationRole> = {
  admin: "admin",
  administrator: "admin",
  company_admin: "admin",
  company_manager: "manager",
  company_member: "member",
  company_owner: "owner",
  company_viewer: "viewer",
  employee: "member",
  manager: "manager",
  member: "member",
  owner: "owner",
  primary_owner: "owner",
  read_only: "viewer",
  readonly: "viewer",
  staff: "member",
  viewer: "viewer",
};

function normalizeComparableId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
}

function normalizeRelationStatus(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return normalized ? normalized : null;
}

function isActiveRelation(input: {
  deletedAt?: string | null;
  endedAt?: string | null;
  status: string;
}): boolean {
  const status = normalizeRelationStatus(input.status);

  return Boolean(status && ACTIVE_RELATION_STATUSES.has(status) && !input.deletedAt && !input.endedAt);
}

function idsMatch(left: unknown, right: unknown): boolean {
  const normalizedLeft = normalizeComparableId(left);
  const normalizedRight = normalizeComparableId(right);

  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

export function normalizeOrganizationRole(value: unknown): OrganizationRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/[\s-]+/g, "_");

  return ORGANIZATION_ROLE_ALIASES[normalized] ?? null;
}

export function isCompanyMemberRelation(
  userId: string,
  companyId: string,
  memberships: readonly OrganizationMembership[],
): boolean {
  return memberships.some(
    (membership) =>
      isActiveRelation(membership) &&
      idsMatch(membership.userId, userId) &&
      idsMatch(membership.companyId, companyId) &&
      Boolean(normalizeOrganizationRole(membership.role)),
  );
}

export function canManageCompany(
  userId: string,
  companyId: string,
  memberships: readonly OrganizationMembership[],
): boolean {
  return memberships.some((membership) => {
    const role = normalizeOrganizationRole(membership.role);

    return (
      isActiveRelation(membership) &&
      idsMatch(membership.userId, userId) &&
      idsMatch(membership.companyId, companyId) &&
      Boolean(role && COMPANY_MANAGEMENT_ROLES.has(role))
    );
  });
}

export function isAgentBuyerRelation(
  agentId: string,
  buyerId: string,
  relations: readonly AgentBuyerRelation[],
): boolean {
  return relations.some(
    (relation) =>
      isActiveRelation(relation) &&
      idsMatch(relation.agentId, agentId) &&
      idsMatch(relation.buyerId, buyerId),
  );
}

export function canViewBuyerAsAgent(
  agentId: string,
  buyerId: string,
  relations: readonly AgentBuyerRelation[],
): boolean {
  return isAgentBuyerRelation(agentId, buyerId, relations);
}

export function isProfessorStudentRelation(
  professorId: string,
  studentId: string,
  relations: readonly ProfessorStudentRelation[],
): boolean {
  return relations.some(
    (relation) =>
      isActiveRelation(relation) &&
      idsMatch(relation.professorId, professorId) &&
      idsMatch(relation.studentId, studentId),
  );
}

export function canViewStudentAsProfessor(
  professorId: string,
  studentId: string,
  relations: readonly ProfessorStudentRelation[],
): boolean {
  return isProfessorStudentRelation(professorId, studentId, relations);
}
