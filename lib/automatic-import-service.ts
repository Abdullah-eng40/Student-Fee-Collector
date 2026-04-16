import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTO_IMPORT_ENABLED_KEY = "auto_import_enabled";
const LAST_IMPORT_CHECK_KEY = "last_import_check";
const IMPORT_CHECK_INTERVAL = 30000; // Check every 30 seconds

/**
 * Service for managing automatic import preferences and tracking
 */
export const AutomaticImportService = {
  /**
   * Check if automatic import is enabled
   */
  async isAutoImportEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(AUTO_IMPORT_ENABLED_KEY);
      return value === "true";
    } catch (error) {
      return false;
    }
  },

  /**
   * Enable automatic import
   */
  async enableAutoImport(): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_IMPORT_ENABLED_KEY, "true");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Disable automatic import
   */
  async disableAutoImport(): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_IMPORT_ENABLED_KEY, "false");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get last import check time
   */
  async getLastImportCheckTime(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(LAST_IMPORT_CHECK_KEY);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Update last import check time
   */
  async updateLastImportCheckTime(): Promise<void> {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(LAST_IMPORT_CHECK_KEY, now.toString());
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if enough time has passed since last import check
   */
  async shouldCheckForImport(): Promise<boolean> {
    try {
      const lastCheck = await this.getLastImportCheckTime();
      const now = Date.now();
      return now - lastCheck > IMPORT_CHECK_INTERVAL;
    } catch (error) {
      return false;
    }
  },
};
