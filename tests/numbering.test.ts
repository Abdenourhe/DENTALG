import { describe, it, expect, vi, beforeEach } from "vitest";

const { upsertMock } = vi.hoisted(() => ({ upsertMock: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { counter: { upsert: upsertMock } },
}));

import { nextNumber } from "@/lib/billing/numbering";

describe("nextNumber", () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  it("increments the counter atomically scoped to clinicId + type", async () => {
    upsertMock.mockResolvedValue({ value: 1 });

    await nextNumber("clinic-1", "INVOICE");

    expect(upsertMock).toHaveBeenCalledWith({
      where: { clinicId_type: { clinicId: "clinic-1", type: "INVOICE" } },
      update: { value: { increment: 1 } },
      create: { clinicId: "clinic-1", type: "INVOICE", value: 1 },
    });
  });

  it("pads the sequence to 4 digits by default", async () => {
    upsertMock.mockResolvedValue({ value: 7 });
    expect(await nextNumber("clinic-1", "PATIENT")).toBe("0007");
  });

  it("applies a custom prefix and padding", async () => {
    upsertMock.mockResolvedValue({ value: 42 });
    expect(
      await nextNumber("clinic-1", "QUOTE", { prefix: "DEV-", pad: 6 }),
    ).toBe("DEV-000042");
  });

  it("does not truncate when the sequence exceeds the padding width", async () => {
    upsertMock.mockResolvedValue({ value: 123456 });
    expect(await nextNumber("clinic-1", "LAB_ORDER")).toBe("123456");
  });

  it("keeps counters independent per clinic", async () => {
    upsertMock.mockResolvedValue({ value: 1 });
    await nextNumber("clinic-A", "INVOICE");
    await nextNumber("clinic-B", "INVOICE");

    expect(upsertMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { clinicId_type: { clinicId: "clinic-A", type: "INVOICE" } },
      }),
    );
    expect(upsertMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { clinicId_type: { clinicId: "clinic-B", type: "INVOICE" } },
      }),
    );
  });
});
