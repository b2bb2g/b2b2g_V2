import assert from "node:assert/strict";
import test from "node:test";
import type { AccountRoleLike } from "./account-roles";

const {
  fallbackToLegacyMemberType,
  getPrimaryRoleFromAccountRoles,
  normalizeRoleKey,
  resolveEffectiveRoles,
} = (await import(new URL("./account-roles.ts", import.meta.url).href)) as typeof import("./account-roles");

function role(input: {
  deletedAt?: string | null;
  roleKey: string;
  status: string;
}): AccountRoleLike {
  return {
    deleted_at: input.deletedAt ?? null,
    role_key: input.roleKey,
    status: input.status,
  };
}

test("normalizeRoleKey trims and lowercases valid role keys", () => {
  assert.equal(normalizeRoleKey(" Supplier "), "supplier");
  assert.equal(normalizeRoleKey("BUYER"), "buyer");
  assert.equal(normalizeRoleKey("premium_supplier"), "premium_supplier");
  assert.equal(normalizeRoleKey("enterprise-supplier"), "enterprise-supplier");
});

test("normalizeRoleKey rejects invalid role keys", () => {
  assert.equal(normalizeRoleKey(""), null);
  assert.equal(normalizeRoleKey(" a "), null);
  assert.equal(normalizeRoleKey("1supplier"), null);
  assert.equal(normalizeRoleKey("supplier role"), null);
  assert.equal(normalizeRoleKey(null), null);
});

test("active account roles take priority over legacy member type fallback", () => {
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: [role({ roleKey: "supplier", status: "active" })],
    legacyMemberTypeCode: "buyer",
  });

  assert.deepEqual(effectiveRoles, ["supplier"]);
});

test("approved account roles take priority over legacy member type fallback", () => {
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: [role({ roleKey: "professor", status: "approved" })],
    legacyMemberTypeCode: "student",
  });

  assert.deepEqual(effectiveRoles, ["professor"]);
});

test("inactive, pending, rejected, and deleted roles are excluded from effective roles", () => {
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: [
      role({ roleKey: "supplier", status: "inactive" }),
      role({ roleKey: "buyer", status: "pending" }),
      role({ roleKey: "agent", status: "rejected" }),
      role({
        deletedAt: "2026-06-29T00:00:00.000Z",
        roleKey: "administrator",
        status: "active",
      }),
    ],
    legacyMemberTypeCode: null,
  });

  assert.deepEqual(effectiveRoles, []);
  assert.equal(
    getPrimaryRoleFromAccountRoles([
      role({ roleKey: "supplier", status: "inactive" }),
      role({ roleKey: "buyer", status: "pending" }),
      role({ roleKey: "agent", status: "rejected" }),
    ]),
    null,
  );
});

test("legacy member type fallback is used when no active account roles exist", () => {
  assert.deepEqual(
    resolveEffectiveRoles({
      accountRoles: [],
      legacyMemberTypeCode: "agent",
    }),
    ["agent"],
  );
});

test("missing account roles and missing legacy fallback return empty roles", () => {
  assert.deepEqual(
    resolveEffectiveRoles({
      accountRoles: [],
      legacyMemberTypeCode: null,
    }),
    [],
  );

  assert.deepEqual(fallbackToLegacyMemberType(undefined), []);
});

test("multi-role accounts keep unique active and approved role keys", () => {
  const effectiveRoles = resolveEffectiveRoles({
    accountRoles: [
      role({ roleKey: "buyer", status: "active" }),
      role({ roleKey: "supplier", status: "approved" }),
      role({ roleKey: "buyer", status: "approved" }),
      role({ roleKey: "student", status: "revoked" }),
    ],
    legacyMemberTypeCode: "agent",
  });

  assert.deepEqual(effectiveRoles, ["buyer", "supplier"]);
});

test("primary role follows administrator, supplier, buyer, agent, professor, student priority", () => {
  assert.equal(
    getPrimaryRoleFromAccountRoles([
      role({ roleKey: "student", status: "active" }),
      role({ roleKey: "buyer", status: "approved" }),
      role({ roleKey: "administrator", status: "active" }),
    ]),
    "administrator",
  );

  assert.equal(
    getPrimaryRoleFromAccountRoles([
      role({ roleKey: "student", status: "active" }),
      role({ roleKey: "buyer", status: "active" }),
      role({ roleKey: "supplier", status: "approved" }),
    ]),
    "supplier",
  );
});
