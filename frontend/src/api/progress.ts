import { CourseProgress } from "@/types/types";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/progress`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token") || "";
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface CourseProgressResponse {
  success: boolean;
  data: CourseProgress;
}

interface AllProgressResponse {
  success: boolean;
  count: number;
  data: CourseProgress[];
}

export interface ProgressHistoryItem {
  date: string;
  progress: number;
}

interface ProgressHistoryResponse {
  success: boolean;
  data: ProgressHistoryItem[];
}

export const updateProgress = async (courseId: string, progressData: Partial<CourseProgress>): Promise<CourseProgressResponse> => {
  try {
    const response = await axios.post(`${API_URL}/${courseId}`, progressData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

export const getProgress = async (courseId: string): Promise<CourseProgressResponse> => {
  try {
    const response = await axios.get(`${API_URL}/${courseId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw error;
  }
};

export const getAllProgress = async (): Promise<AllProgressResponse> => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching all progress:", error);
    throw error;
  }
};

export const markLessonComplete = async (courseId: string, lessonId: string): Promise<CourseProgressResponse> => {
  try {
    const response = await axios.put(`${API_URL}/${courseId}/complete/${lessonId}`, {}, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
  }
};

export const getProgressHistory = async (courseId: string): Promise<ProgressHistoryItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/${courseId}/history`, getAuthConfig());
    return response.data.data;
  } catch (error) {
    console.error("Error fetching progress history:", error);
    throw error;
  }
};
