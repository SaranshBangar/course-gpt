import { Course } from "@/types/types";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/courses`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token") || "";
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface CourseResponse {
  success: boolean;
  data: Course;
}

interface CoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
}

export const createCourse = async (courseData: Course): Promise<CourseResponse> => {
  try {
    const response = await axios.post(API_URL, courseData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const getCourses = async (): Promise<CoursesResponse> => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCourse = async (courseId: string): Promise<CourseResponse> => {
  try {
    const response = await axios.get(`${API_URL}/${courseId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<CourseResponse> => {
  try {
    const response = await axios.put(`${API_URL}/${courseId}`, courseData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<{ success: boolean; data: {} }> => {
  try {
    const response = await axios.delete(`${API_URL}/${courseId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export const addModule = async (courseId: string, moduleData: any): Promise<CourseResponse> => {
  try {
    const response = await axios.post(`${API_URL}/${courseId}/modules`, moduleData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error adding module:", error);
    throw error;
  }
};

export const addLesson = async (courseId: string, moduleId: string, lessonData: any): Promise<CourseResponse> => {
  try {
    const response = await axios.post(`${API_URL}/${courseId}/modules/${moduleId}/lessons`, lessonData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error adding lesson:", error);
    throw error;
  }
};
