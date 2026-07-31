import { describe, it, expect } from "vitest";
import { PERMISSIONS } from "@/lib/permissions";
import { Role } from "@prisma/client";

describe("PERMISSIONS matrix", () => {
  it("grants OWNER every non-platform permission", () => {
    for (const [permission, roles] of Object.entries(PERMISSIONS)) {
      if (permission === "platform:admin") {
        expect(roles).not.toContain(Role.OWNER);
      } else {
        expect(roles).toContain(Role.OWNER);
      }
    }
  });

  it("restricts users:manage to OWNER only", () => {
    expect(PERMISSIONS["users:manage"]).toEqual([Role.OWNER]);
  });

  it("grants DENTIST clinical write access", () => {
    expect(PERMISSIONS["patients:write"]).toContain(Role.DENTIST);
    expect(PERMISSIONS["appointments:write"]).toContain(Role.DENTIST);
  });

  it("restricts billing to OWNER and SECRETARY", () => {
    expect(PERMISSIONS["billing:read"]).toEqual([Role.OWNER, Role.SECRETARY]);
    expect(PERMISSIONS["billing:write"]).toEqual([Role.OWNER, Role.SECRETARY]);
  });

  it("grants platform:admin only to PLATFORM_ADMIN", () => {
    expect(PERMISSIONS["platform:admin"]).toEqual([Role.PLATFORM_ADMIN]);
  });
});
