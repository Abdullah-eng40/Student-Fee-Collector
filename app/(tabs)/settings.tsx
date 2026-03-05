import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useStudents } from "@/lib/student-context";
import { useState } from "react";
import { CURRENCY_SYMBOL } from "@/lib/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as storage from "@/lib/storage";

export default function SettingsScreen() {
  const colors = useColors();
  const { students, payments, refreshData } = useStudents();
  const [exporting, setExporting] = useState(false);

  // Calculate current month payments
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonthPayments = payments.filter(
    (p) => p.month === currentMonth && p.year === currentYear
  ).length;

  const handleExportData = async () => {
    try {
      setExporting(true);

      // Prepare CSV data
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

      // Save to file
      const fileName = `student_fees_${new Date().getTime()}.csv`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Student Fee Data",
        });
      } else {
        Alert.alert("Success", "Data exported to file");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all students and payment records? This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await storage.clearAllData();
              await refreshData();
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <MaterialIcons name="settings" size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted mt-1">App configuration and data management</Text>
          </View>
        </View>

        {/* Data Summary */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-4">Data Summary</Text>
          <View className="flex-row justify-between mb-3">
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Current Month</Text>
              <Text className="text-lg font-bold text-foreground">{currentMonthPayments}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Total Students</Text>
              <Text className="text-lg font-bold text-foreground">{students.length}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted mb-1">Total Payments</Text>
              <Text className="text-lg font-bold text-foreground">{payments.length}</Text>
            </View>
          </View>
          <View className="flex-row justify-between pt-3 border-t border-border">
            <Text className="text-sm text-muted">Total Amount Collected</Text>
            <Text className="text-sm font-semibold text-success">
              {CURRENCY_SYMBOL}{payments.reduce((sum, p) => sum + p.amount, 0)}
            </Text>
          </View>
        </View>

        {/* Export Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Data Management</Text>
          <TouchableOpacity
            onPress={handleExportData}
            disabled={exporting}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              opacity: exporting ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="download" size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-3">
              {exporting ? "Exporting..." : "Export as CSV"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-error mb-3">Danger Zone</Text>
          <TouchableOpacity
            onPress={handleClearData}
            style={{
              backgroundColor: colors.error,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-3">Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="bg-surface rounded-lg p-4 border border-border mt-auto">
          <Text className="text-sm font-semibold text-foreground mb-2">About</Text>
          <Text className="text-xs text-muted">Student Fee Collector v1.0.0</Text>
          <Text className="text-xs text-muted mt-2">
            A simple app to manage student fee collection and track monthly payments.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
