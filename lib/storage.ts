import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student, Payment, StudentWithPayments } from "./types";

const STUDENTS_KEY = "students";
const PAYMENTS_KEY = "payments";

/**
 * Get all students from storage
 */
export async function getStudents(): Promise<Student[]> {
  try {
    const data = await AsyncStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Save a new student
 */
export async function saveStudent(student: Student): Promise<void> {
  try {
    const students = await getStudents();
    students.push(student);
    await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing student
 */
export async function updateStudent(student: Student): Promise<void> {
  try {
    const students = await getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      students[index] = student;
      await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(studentId: string): Promise<void> {
  try {
    const students = await getStudents();
    const filtered = students.filter((s) => s.id !== studentId);
    await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(filtered));
    // Also delete all payments for this student
    await deletePaymentsByStudent(studentId);
  } catch (error) {
    throw error;
  }
}

/**
 * Get all payments from storage
 */
export async function getPayments(): Promise<Payment[]> {
  try {
    const data = await AsyncStorage.getItem(PAYMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Get payments for a specific student
 */
export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  try {
    const payments = await getPayments();
    return payments.filter((p) => p.studentId === studentId);
  } catch (error) {
    return [];
  }
}

/**
 * Save a new payment
 */
export async function savePayment(payment: Payment): Promise<void> {
  try {
    const payments = await getPayments();
    payments.push(payment);
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    throw error;
  }
}

/**
 * Check if a payment exists for a student in a specific month/year
 */
export async function getPaymentForMonth(
  studentId: string,
  month: number,
  year: number
): Promise<Payment | undefined> {
  try {
    const payments = await getStudentPayments(studentId);
    return payments.find((p) => p.month === month && p.year === year);
  } catch (error) {
    return undefined;
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(paymentId: string): Promise<void> {
  try {
    const payments = await getPayments();
    const filtered = payments.filter((p) => p.id !== paymentId);
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    throw error;
  }
}

/**
 * Delete all payments for a student
 */
export async function deletePaymentsByStudent(studentId: string): Promise<void> {
  try {
    const payments = await getPayments();
    const filtered = payments.filter((p) => p.studentId !== studentId);
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    throw error;
  }
}

/**
 * Get student with all their payments
 */
export async function getStudentWithPayments(studentId: string): Promise<StudentWithPayments | null> {
  try {
    const students = await getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const payments = await getStudentPayments(studentId);
    return { ...student, payments };
  } catch (error) {
    return null;
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STUDENTS_KEY, PAYMENTS_KEY]);
  } catch (error) {
    throw error;
  }
}
