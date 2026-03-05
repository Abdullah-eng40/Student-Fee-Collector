import { View, Text, TouchableOpacity, ScrollView, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useStudents } from "@/lib/student-context";
import { Student, Payment, MONTH_SHORT, CURRENCY_SYMBOL } from "@/lib/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

export default function StudentDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { students, payments, addPayment, deletePayment, deleteStudent } = useStudents();

  const [student, setStudent] = useState<Student | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === "string") {
      const found = students.find((s) => s.id === id);
      setStudent(found || null);
      const studentPay = payments.filter((p) => p.studentId === id);
      setStudentPayments(studentPay);
      setLoading(false);
    }
  }, [id, students, payments]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Calculate current month payments
  const currentMonthPayments = studentPayments.filter(
    (p) => p.month === currentMonth && p.year === currentYear
  ).length;

  const handleMarkPayment = async (month: number) => {
    if (!student) return;

    const existingPayment = studentPayments.find((p) => p.month === month && p.year === currentYear);

    if (existingPayment) {
      Alert.alert(
        "Remove Payment",
        `Remove payment for ${MONTH_SHORT[month]}?`,
        [
          { text: "Cancel", onPress: () => {}, style: "cancel" },
          {
            text: "Remove",
            onPress: async () => {
              try {
                await deletePayment(existingPayment.id);
              } catch (error) {
                Alert.alert("Error", "Failed to remove payment");
              }
            },
            style: "destructive",
          },
        ]
      );
    } else {
      try {
        await addPayment(student.id, month, currentYear);
      } catch (error) {
        Alert.alert("Error", "Failed to mark payment");
      }
    }
  };

  const handleDeleteStudent = () => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${student?.name}? This will also remove all payment records.`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              if (student) {
                await deleteStudent(student.id);
                router.back();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete student");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleViewHistory = () => {
    if (student) {
      router.push(`/payment-history/${student.id}`);
    }
  };

  const handleEditStudent = () => {
    if (student) {
      router.push(`/edit-student/${student.id}`);
    }
  };

  if (loading || !student) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">{student.name}</Text>
            <Text className="text-sm text-muted mt-1">Class: {student.class}</Text>
          </View>
        </View>

        {/* Student Info Card */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-muted">Monthly Fee</Text>
            <Text className="text-lg font-bold text-foreground">{CURRENCY_SYMBOL}{student.monthlyFee}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted">Year</Text>
            <Text className="text-lg font-bold text-foreground">{currentYear}</Text>
          </View>
        </View>

        {/* Monthly Payment Grid */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Monthly Payments</Text>
          <View className="flex-row flex-wrap gap-2">
            {MONTH_SHORT.map((month, index) => {
              const isPaid = studentPayments.some((p) => p.month === index && p.year === currentYear);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMarkPayment(index)}
                  style={{
                    backgroundColor: isPaid ? colors.success : colors.surface,
                    borderWidth: isPaid ? 0 : 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flex: 0.31,
                    alignItems: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: isPaid ? "#ffffff" : colors.foreground,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {month}
                  </Text>
                  {isPaid && (
                    <MaterialIcons name="check" size={16} color="#ffffff" style={{ marginTop: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment Summary */}
        <View className="bg-primary/10 rounded-lg p-4 mb-6 border border-primary/20">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-sm text-muted mb-2">Current Month</Text>
              <Text className="text-xl font-bold text-foreground">{currentMonthPayments}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-2">Payments This Year</Text>
              <Text className="text-xl font-bold text-foreground">
                {studentPayments.filter((p) => p.year === currentYear).length}/12
              </Text>
            </View>
          </View>
          <Text className="text-xs text-muted mt-3">
            Total: {CURRENCY_SYMBOL}
            {studentPayments.filter((p) => p.year === currentYear).reduce((sum, p) => sum + p.amount, 0)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-auto">
          <TouchableOpacity
            onPress={handleEditStudent}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">Edit Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewHistory}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="history" size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">View Payment History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteStudent}
            style={{
              backgroundColor: colors.error,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete" size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">Delete Student</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
