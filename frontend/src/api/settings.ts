import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/settings`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface NotificationSettings {
  email: boolean;
  inApp: boolean;
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  defaultDifficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface SettingsResponse {
  success: boolean;
  data: UserSettings;
}

export const getSettings = async (): Promise<SettingsResponse> => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

export const updateSettings = async (settingsData: Partial<UserSettings>): Promise<SettingsResponse> => {
  try {
    const response = await axios.put(API_URL, settingsData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export const toggleNotifications = async (notificationSettings: Partial<NotificationSettings>): Promise<SettingsResponse> => {
  try {
    const response = await axios.patch(`${API_URL}/notifications`, notificationSettings, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error toggling notifications:", error);
    throw error;
  }
};

export default {
  getSettings,
  updateSettings,
  toggleNotifications,
};
