import assert from "node:assert/strict";
import test from "node:test";
import type {
  AgentBuyerRelation,
  OrganizationMembership,
  ProfessorStudentRelation,
} from "./organization";

const {
  canManageCompany,
  canViewBuyerAsAgent,
  canViewStudentAsProfessor,
  isAgentBuyerRelation,
  isCompanyMemberRelation,
  isProfessorStudentRelation,
  normalizeOrganizationRole,
} = (await import(new URL("./organization.ts", import.meta.url).href)) as typeof import("./organization");

function membership(input: Partial<OrganizationMembership> = {}): OrganizationMembership {
  return {
    companyId: input.companyId ?? "company-1",
    deletedAt: input.deletedAt ?? null,
    endedAt: input.endedAt ?? null,
    role: input.role ?? "member",
    status: input.status ?? "active",
    userId: input.userId ?? "user-1",
  };
}

function agentBuyer(input: Partial<AgentBuyerRelation> = {}): AgentBuyerRelation {
  return {
    agentId: input.agentId ?? "agent-1",
    buyerId: input.buyerId ?? "buyer-1",
    deletedAt: input.deletedAt ?? null,
    endedAt: input.endedAt ?? null,
    status: input.status ?? "active",
  };
}

function professorStudent(input: Partial<ProfessorStudentRelation> = {}): ProfessorStudentRelation {
  return {
    deletedAt: input.deletedAt ?? null,
    endedAt: input.endedAt ?? null,
    professorId: input.professorId ?? "professor-1",
    status: input.status ?? "active",
    studentId: input.studentId ?? "student-1",
  };
}

test("normalizeOrganizationRole normalizes supported company roles", () => {
  assert.equal(normalizeOrganizationRole(" Owner "), "owner");
  assert.equal(normalizeOrganizationRole("company-admin"), "admin");
  assert.equal(normalizeOrganizationRole("Company Manager"), "manager");
  assert.equal(normalizeOrganizationRole("staff"), "member");
  assert.equal(normalizeOrganizationRole("read only"), "viewer");
  assert.equal(normalizeOrganizationRole("supplier"), null);
  assert.equal(normalizeOrganizationRole(null), null);
});

test("agent can view subordinate buyer", () => {
  const relations = [agentBuyer()];

  assert.equal(isAgentBuyerRelation("agent-1", "buyer-1", relations), true);
  assert.equal(canViewBuyerAsAgent("agent-1", "buyer-1", relations), true);
});

test("agent cannot view non-subordinate buyer", () => {
  const relations = [agentBuyer({ buyerId: "buyer-2" })];

  assert.equal(isAgentBuyerRelation("agent-1", "buyer-1", relations), false);
  assert.equal(canViewBuyerAsAgent("agent-1", "buyer-1", relations), false);
});

test("professor can view subordinate student", () => {
  const relations = [professorStudent()];

  assert.equal(isProfessorStudentRelation("professor-1", "student-1", relations), true);
  assert.equal(canViewStudentAsProfessor("professor-1", "student-1", relations), true);
});

test("professor cannot view other student", () => {
  const relations = [professorStudent({ studentId: "student-2" })];

  assert.equal(isProfessorStudentRelation("professor-1", "student-1", relations), false);
  assert.equal(canViewStudentAsProfessor("professor-1", "student-1", relations), false);
});

test("company owner can manage company", () => {
  const memberships = [membership({ role: "owner" })];

  assert.equal(isCompanyMemberRelation("user-1", "company-1", memberships), true);
  assert.equal(canManageCompany("user-1", "company-1", memberships), true);
});

test("company member without manager role cannot manage company", () => {
  const memberships = [membership({ role: "member" })];

  assert.equal(isCompanyMemberRelation("user-1", "company-1", memberships), true);
  assert.equal(canManageCompany("user-1", "company-1", memberships), false);
});

test("deleted, ended, and inactive relations are ignored", () => {
  assert.equal(
    canManageCompany("user-1", "company-1", [
      membership({ deletedAt: "2026-06-29T00:00:00.000Z", role: "owner" }),
      membership({ endedAt: "2026-06-29T00:00:00.000Z", role: "admin" }),
      membership({ role: "manager", status: "inactive" }),
    ]),
    false,
  );
  assert.equal(
    canViewBuyerAsAgent("agent-1", "buyer-1", [
      agentBuyer({ deletedAt: "2026-06-29T00:00:00.000Z" }),
      agentBuyer({ endedAt: "2026-06-29T00:00:00.000Z" }),
      agentBuyer({ status: "suspended" }),
    ]),
    false,
  );
  assert.equal(
    canViewStudentAsProfessor("professor-1", "student-1", [
      professorStudent({ deletedAt: "2026-06-29T00:00:00.000Z" }),
      professorStudent({ endedAt: "2026-06-29T00:00:00.000Z" }),
      professorStudent({ status: "inactive" }),
    ]),
    false,
  );
});

test("country agent and referral shaped inputs are not accepted as relation authority", () => {
  const countryAgentShape = [
    {
      agent_id: "agent-1",
      country_id: "country-1",
      status: "active",
    },
  ] as unknown as AgentBuyerRelation[];
  const referralRelationShape = [
    {
      child_buyer_id: "buyer-1",
      parent_buyer_id: "agent-1",
      status: "active",
    },
  ] as unknown as AgentBuyerRelation[];

  assert.equal(canViewBuyerAsAgent("agent-1", "buyer-1", countryAgentShape), false);
  assert.equal(canViewBuyerAsAgent("agent-1", "buyer-1", referralRelationShape), false);
});
