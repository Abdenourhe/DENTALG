import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/auth", () => ({ auth: authMock }));

// next/navigation's real notFound() throws a special NEXT_NOT_FOUND error;
// using the real implementation lets us assert the exact thrown digest.
vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return actual;
});

import {
  getClinicContext,
  withClinic,
  requireClinicContext,
} from "@/lib/tenant";

describe("withClinic", () => {
  it("merges clinicId from context into the payload", () => {
    const result = withClinic(
      { clinicId: "clinic-1", userId: "user-1" },
      { name: "Patient X" },
    );
    expect(result).toEqual({ name: "Patient X", clinicId: "clinic-1" });
  });
});

describe("getClinicContext", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns clinicId and userId for a normal clinic user", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "OWNER", clinicId: "clinic-1" },
    });

    await expect(getClinicContext()).resolves.toEqual({
      clinicId: "clinic-1",
      userId: "user-1",
    });
  });

  it("rejects when there is no session", async () => {
    authMock.mockResolvedValue(null);
    await expect(getClinicContext()).rejects.toThrow(
      "Contexte cabinet requis.",
    );
  });

  it("rejects a platform admin even if clinicId is somehow set", async () => {
    authMock.mockResolvedValue({
      user: { id: "admin-1", role: "PLATFORM_ADMIN", clinicId: "clinic-1" },
    });
    await expect(getClinicContext()).rejects.toThrow(
      "Contexte cabinet requis.",
    );
  });

  it("rejects a clinic user with no clinicId", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "OWNER", clinicId: null },
    });
    await expect(getClinicContext()).rejects.toThrow(
      "Contexte cabinet requis.",
    );
  });
});

describe("requireClinicContext", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns the context when valid", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-1", role: "SECRETARY", clinicId: "clinic-1" },
    });
    await expect(requireClinicContext()).resolves.toEqual({
      clinicId: "clinic-1",
      userId: "user-1",
    });
  });

  it("triggers a 404 (never a raw exception) when the context is invalid", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireClinicContext()).rejects.toThrow(
      /NEXT_HTTP_ERROR_FALLBACK|NEXT_NOT_FOUND/,
    );
  });
});
