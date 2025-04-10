import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/auth`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UpdateDetailsRequest {
  username?: string;
  email?: string;
}

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  settings: {
    theme: string;
    notifications: {
      email: boolean;
      inApp: boolean;
    };
    defaultDifficulty: string;
  };
  courses?: string[];
}

interface AuthResponse {
  success: boolean;
  token: string;
  data: UserData;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = async (): Promise<MessageResponse> => {
  try {
    const response = await axios.get(`${API_URL}/logout`);
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getMe = async (): Promise<{ success: boolean; data: UserData }> => {
  try {
    const response = await axios.get(`${API_URL}/me`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateDetails = async (data: UpdateDetailsRequest): Promise<{ success: boolean; data: UserData }> => {
  try {
    const response = await axios.put(`${API_URL}/updatedetails`, data, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

export const updatePassword = async (data: UpdatePasswordRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.put(`${API_URL}/updatepassword`, data, getAuthConfig());
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
};
