import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportAsCSV, exportAsXLS, exportAsPDF } from "../export-service";
import { Student, Payment } from "../types";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// Mock global __DEV__
(global as any).__DEV__ = false;

// Mock FileSystem
vi.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "/cache/",
  writeAsStringAsync: vi.fn(),
  EncodingType: {
    Base64: "base64",
  },
}));

// Mock Sharing
vi.mock("expo-sharing", () => ({
  isAvailableAsync: vi.fn(() => Promise.resolve(false)),
  shareAsync: vi.fn(),
}));

// Mock xlsx
vi.mock("xlsx", () => ({
  default: {
    utils: {
      book_new: vi.fn(() => ({})),
      json_to_sheet: vi.fn((data) => ({ data })),
      book_append_sheet: vi.fn(),
    },
    write: vi.fn(() => "base64content"),
  },
}));

describe("Export Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStudents: Student[] = [
    {
      id: "1",
      name: "John Doe",
      class: "10-A",
      monthlyFee: 5000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Jane Smith",
      class: "10-B",
      monthlyFee: 5000,
      createdAt: new Date().toISOString(),
    },
  ];

  const mockPayments: Payment[] = [
    {
      id: "p1",
      studentId: "1",
      month: 0,
      year: 2026,
      amount: 5000,
      paidDate: new Date().toISOString(),
    },
    {
      id: "p2",
      studentId: "2",
      month: 0,
      year: 2026,
      amount: 5000,
      paidDate: new Date().toISOString(),
    },
  ];

  describe("exportAsCSV", () => {
    it("should export students and payments as CSV", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockResolvedValueOnce(undefined);

      await exportAsCSV(mockStudents, mockPayments);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      const call = vi.mocked(FileSystem.writeAsStringAsync).mock.calls[0];
      expect(call[0]).toContain("student_fees_");
      expect(call[1]).toContain("Student Name,Class,Monthly Fee");
      expect(call[1]).toContain("John Doe");
      expect(call[1]).toContain("Jane Smith");
    });

    it("should handle export errors gracefully", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockRejectedValueOnce(
        new Error("Write failed")
      );

      await expect(exportAsCSV(mockStudents, mockPayments)).rejects.toThrow(
        "Write failed"
      );
    });
  });

  describe("exportAsXLS", () => {
    it("should export students and payments as XLS", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockResolvedValueOnce(undefined);

      await exportAsXLS(mockStudents, mockPayments);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      const call = vi.mocked(FileSystem.writeAsStringAsync).mock.calls[0];
      expect(call[0]).toContain("student_fees_");
      expect(call[0]).toContain(".xlsx");
    });

    it("should handle export errors gracefully", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockRejectedValueOnce(
        new Error("Write failed")
      );

      await expect(exportAsXLS(mockStudents, mockPayments)).rejects.toThrow(
        "Write failed"
      );
    });
  });

  describe("exportAsPDF", () => {
    it("should export students and payments as PDF", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockResolvedValueOnce(undefined);

      await exportAsPDF(mockStudents, mockPayments);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      const call = vi.mocked(FileSystem.writeAsStringAsync).mock.calls[0];
      expect(call[0]).toContain("student_fees_");
      expect(call[1]).toContain("Student Fee Collection Report");
      expect(call[1]).toContain("John Doe");
      expect(call[1]).toContain("Jane Smith");
    });

    it("should include payment details in PDF", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockResolvedValueOnce(undefined);

      await exportAsPDF(mockStudents, mockPayments);

      const call = vi.mocked(FileSystem.writeAsStringAsync).mock.calls[0];
      const content = call[1] as string;
      expect(content).toContain("Payment Details");
      expect(content).toContain("Total Students");
      expect(content).toContain("Total Payments");
    });

    it("should handle export errors gracefully", async () => {
      vi.mocked(FileSystem.writeAsStringAsync).mockRejectedValueOnce(
        new Error("Write failed")
      );

      await expect(exportAsPDF(mockStudents, mockPayments)).rejects.toThrow(
        "Write failed"
      );
    });
  });
});
