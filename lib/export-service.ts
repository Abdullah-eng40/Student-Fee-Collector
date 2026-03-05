import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";
import { Student, Payment, CURRENCY_SYMBOL } from "./types";

/**
 * Export student payment data as XLS file
 */
export async function exportAsXLS(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Student Summary
    const summaryData = students.map((student) => {
      const studentPayments = payments.filter((p) => p.studentId === student.id);
      const totalAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const lastPayment = studentPayments.sort(
        (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
      )[0];

      return {
        "Student Name": student.name,
        Class: student.class,
        "Monthly Fee": student.monthlyFee,
        "Total Payments": studentPayments.length,
        "Total Amount Paid": totalAmount,
        "Last Payment Date": lastPayment
          ? new Date(lastPayment.paidDate).toLocaleDateString("en-IN")
          : "N/A",
      };
    });

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Sheet 2: Payment Details
    const paymentData = payments.map((payment) => {
      const student = students.find((s) => s.id === payment.studentId);
      return {
        "Student Name": student?.name || "Unknown",
        Class: student?.class || "N/A",
        Month: new Date(payment.paidDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
        }),
        "Payment Date": new Date(payment.paidDate).toLocaleDateString("en-IN"),
        Amount: payment.amount,
      };
    });

    const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
    XLSX.utils.book_append_sheet(workbook, paymentSheet, "Payments");

    // Sheet 3: Monthly Summary
    const monthlyData: Record<string, any> = {};

    students.forEach((student) => {
      const studentPayments = payments.filter((p) => p.studentId === student.id);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const row: Record<string, any> = {
        "Student Name": student.name,
        Class: student.class,
      };

      months.forEach((month, index) => {
        const paid = studentPayments.some((p) => p.month === index);
        row[month] = paid ? "Paid" : "Unpaid";
      });

      monthlyData[student.id] = row;
    });

    const monthlySummaryData = Object.values(monthlyData);
    const monthlySheet = XLSX.utils.json_to_sheet(monthlySummaryData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Status");

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
        dialogTitle: "Export Student Fee Data (XLS)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting XLS:", error);
    throw error;
  }
}

/**
 * Export student payment data as PDF file
 */
export async function exportAsPDF(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
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
          </style>
        </head>
        <body>
          <h1>Student Fee Collection Report</h1>
          <p class="summary">
            <strong>Report Generated:</strong> ${new Date().toLocaleDateString("en-IN")}<br>
            <strong>Total Students:</strong> ${students.length}<br>
            <strong>Total Payments:</strong> ${payments.length}<br>
            <strong>Total Amount Collected:</strong> ${CURRENCY_SYMBOL}${payments.reduce((sum, p) => sum + p.amount, 0)}
          </p>

          <h2>Student Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Monthly Fee</th>
                <th>Total Payments</th>
                <th>Total Amount Paid</th>
                <th>Last Payment</th>
              </tr>
            </thead>
            <tbody>
    `;

    students.forEach((student) => {
      const studentPayments = payments.filter((p) => p.studentId === student.id);
      const totalAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const lastPayment = studentPayments.sort(
        (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
      )[0];

      htmlContent += `
        <tr>
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>${CURRENCY_SYMBOL}${student.monthlyFee}</td>
          <td>${studentPayments.length}</td>
          <td>${CURRENCY_SYMBOL}${totalAmount}</td>
          <td>${lastPayment ? new Date(lastPayment.paidDate).toLocaleDateString("en-IN") : "N/A"}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>

          <h2>Payment Details</h2>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Payment Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
    `;

    payments
      .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime())
      .forEach((payment) => {
        const student = students.find((s) => s.id === payment.studentId);
        htmlContent += `
        <tr>
          <td>${student?.name || "Unknown"}</td>
          <td>${student?.class || "N/A"}</td>
          <td>${new Date(payment.paidDate).toLocaleDateString("en-IN")}</td>
          <td>${CURRENCY_SYMBOL}${payment.amount}</td>
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
        dialogTitle: "Export Student Fee Data (PDF/HTML)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
}

/**
 * Generate CSV export (already exists but adding for completeness)
 */
export async function exportAsCSV(
  students: Student[],
  payments: Payment[]
): Promise<string | null> {
  try {
    let csvContent = "Student Name,Class,Monthly Fee,Total Payments,Total Amount Paid,Last Payment Date\n";

    for (const student of students) {
      const studentPayments = payments.filter((p) => p.studentId === student.id);
      const totalAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const lastPayment = studentPayments.sort(
        (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
      )[0];

      const lastPaymentDate = lastPayment
        ? new Date(lastPayment.paidDate).toLocaleDateString("en-IN")
        : "N/A";

      csvContent += `"${student.name}","${student.class}",${student.monthlyFee},${studentPayments.length},${totalAmount},"${lastPaymentDate}"\n`;
    }

    const fileName = `student_fees_${new Date().getTime()}.csv`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/csv",
        dialogTitle: "Export Student Fee Data (CSV)",
      });
    }

    return filePath;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
}
