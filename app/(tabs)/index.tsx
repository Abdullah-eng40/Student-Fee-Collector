import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useStudents } from "@/lib/student-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Payment } from "@/lib/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { students, payments, loading, error, refreshData } = useStudents();
  const [studentPaymentStatus, setStudentPaymentStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    refreshData();
  }, []);

  // Check if students have paid this month
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const status: Record<string, boolean> = {};
    students.forEach((student) => {
      const paid = payments.some(
        (p) => p.studentId === student.id && p.month === currentMonth && p.year === currentYear
      );
      status[student.id] = paid;
    });
    setStudentPaymentStatus(status);
  }, [students, payments]);

  const handleAddStudent = () => {
    router.push("/add-student");
  };

  const handleStudentPress = (studentId: string) => {
    router.push(`/student-detail/${studentId}`);
  };

  const renderStudentItem = ({ item }: { item: (typeof students)[0] }) => {
    const isPaid = studentPaymentStatus[item.id];
    return (
      <TouchableOpacity
        onPress={() => handleStudentPress(item.id)}
        style={{ opacity: 1 }}
        activeOpacity={0.7}
      >
        <View className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{item.name}</Text>
            <Text className="text-sm text-muted mt-1">
              Class: {item.class} | Fee: ₹{item.monthlyFee}
            </Text>
          </View>
          <View className="items-center ml-4">
            {isPaid ? (
              <View className="bg-success rounded-full p-2">
                <MaterialIcons name="check" size={20} color="#ffffff" />
              </View>
            ) : (
              <View className="bg-warning rounded-full p-2">
                <MaterialIcons name="schedule" size={20} color="#ffffff" />
              </View>
            )}
            <Text className="text-xs text-muted mt-1">{isPaid ? "Paid" : "Pending"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Students</Text>
          <Text className="text-sm text-muted mt-1">Manage student fee collection</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted">Loading students...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-error/10 border border-error rounded-lg p-4 mb-4">
            <Text className="text-error text-sm">{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="school" size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">No Students Yet</Text>
            <Text className="text-sm text-muted text-center mt-2">
              Add your first student to get started
            </Text>
          </View>
        )}

        {/* Student List */}
        {!loading && students.length > 0 && (
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </View>

      {/* Add Student Button */}
      <TouchableOpacity
        onPress={handleAddStudent}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 24,
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color="#ffffff" />
        <Text className="text-white font-semibold ml-2">Add Student</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
