import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";
import { Student, Payment, CURRENCY_SYMBOL } from "./types";

/**
 * Get current month and year
 */
function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

/**
 * Export current month student payment data as XLS file
 * Columns: Name, Class, Fee, Submit Date, Total Amount Collected (from all students)
 */
export async function exportAsXLS(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
    const { month, year } = getCurrentMonthYear();

    // Filter payments for current month only
    const currentMonthPayments = payments.filter((p) => p.month === month && p.year === year);

    // Calculate total amount collected from all students in current month
    const totalAmountCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Create export data with 6 columns
    const exportData = students.map((student) => {
      const studentPayment = currentMonthPayments.find((p) => p.studentId === student.id);
      const submitDate = studentPayment
        ? new Date(studentPayment.paidDate).toLocaleDateString("en-IN")
        : "Not Paid";

      return {
        Name: student.name,
        Class: student.class,
        Fee: student.monthlyFee,
        "Submit Date": submitDate,
        "Total Amount Collected": totalAmountCollected,
        Status: studentPayment ? "Paid" : "Pending",
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    sheet["!cols"] = [
      { wch: 20 }, // Name
      { wch: 12 }, // Class
      { wch: 10 }, // Fee
      { wch: 15 }, // Submit Date
      { wch: 20 }, // Total Amount Collected
      { wch: 10 }, // Status
    ];

    XLSX.utils.book_append_sheet(workbook, sheet, "Current Month");

    // Write file
    const fileName = `student_fees_${new Date().getTime()}.xlsx`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    const xlsxData = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    await FileSystem.writeAsStringAsync(filePath, xlsxData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Export Current Month Student Fee Data (XLS)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting XLS:", error);
    throw error;
  }
}

/**
 * Export current month student payment data as PDF file
 * Columns: Name, Class, Fee, Submit Date, Total Amount Collected (from all students)
 */
export async function exportAsPDF(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
    const { month, year } = getCurrentMonthYear();
    const monthName = new Date(year, month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    // Filter payments for current month only
    const currentMonthPayments = payments.filter((p) => p.month === month && p.year === year);

    // Calculate total amount collected from all students in current month
    const totalAmountCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Count paid students
    const paidCount = currentMonthPayments.length;

    // Create PDF content as HTML
    let htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            h2 { color: #0a7ea4; margin-top: 20px; border-bottom: 2px solid #0a7ea4; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #0a7ea4; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f5f5f5; }
            .summary { background-color: #f0f8ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .paid { color: #22C55E; font-weight: bold; }
            .pending { color: #F59E0B; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Student Fee Collection Report - ${monthName}</h1>
          <p class="summary">
            <strong>Report Generated:</strong> ${new Date().toLocaleDateString("en-IN")}<br>
            <strong>Month:</strong> ${monthName}<br>
            <strong>Total Students:</strong> ${students.length}<br>
            <strong>Fees Paid:</strong> ${paidCount}<br>
            <strong>Total Amount Collected:</strong> RS${totalAmountCollected}
          </p>

          <h2>Current Month Payment Status</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Fee</th>
                <th>Submit Date</th>
                <th>Total Amount Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    students.forEach((student) => {
      const studentPayment = currentMonthPayments.find((p) => p.studentId === student.id);
      const submitDate = studentPayment
        ? new Date(studentPayment.paidDate).toLocaleDateString("en-IN")
        : "Not Paid";
      const status = studentPayment ? '<span class="paid">Paid</span>' : '<span class="pending">Pending</span>';

      htmlContent += `
        <tr>
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>RS${student.monthlyFee}</td>
          <td>${submitDate}</td>
          <td>RS${totalAmountCollected}</td>
          <td>${status}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>

          <div class="footer">
            <p>This is an auto-generated report from Student Fee Collector</p>
            <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
          </div>
        </body>
      </html>
    `;

    // Convert HTML to PDF using a simple approach
    // For React Native, we'll save as HTML and let user convert or use a web service
    const fileName = `student_fees_${new Date().getTime()}.html`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, htmlContent);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        dialogTitle: "Export Current Month Student Fee Data (PDF/HTML)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
}

/**
 * Export current month student payment data as CSV file
 * Columns: Name, Class, Fee, Submit Date, Total Amount Collected (from all students)
 */
export async function exportAsCSV(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
    const { month, year } = getCurrentMonthYear();

    // Filter payments for current month only
    const currentMonthPayments = payments.filter((p) => p.month === month && p.year === year);

    // Calculate total amount collected from all students in current month
    const totalAmountCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    let csvContent = "Name,Class,Fee,Submit Date,Total Amount Collected,Status\n";

    for (const student of students) {
      const studentPayment = currentMonthPayments.find((p) => p.studentId === student.id);
      const submitDate = studentPayment
        ? new Date(studentPayment.paidDate).toLocaleDateString("en-IN")
        : "Not Paid";
      const status = studentPayment ? "Paid" : "Pending";

      csvContent += `"${student.name}","${student.class}",${student.monthlyFee},"${submitDate}",${totalAmountCollected},"${status}"\n`;
    }

    const fileName = `student_fees_${new Date().getTime()}.csv`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/csv",
        dialogTitle: "Export Current Month Student Fee Data (CSV)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
}
