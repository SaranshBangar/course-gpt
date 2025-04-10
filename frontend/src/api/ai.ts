import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/ai`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface GenerateLessonContentRequest {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface GenerateLessonContentResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    learningOutcomes: string[];
    keyConcepts: string[];
    activities: string[];
  };
}

interface EnhanceContentResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: {
      moduleIndex: number;
      lessonIndex: number;
      suggestedImprovements: string;
      rawAIResponse: string;
    }[];
  };
}

interface GenerateCourseStructureRequest {
  topic: string;
  targetAudience: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface Lesson {
  topic: string;
  order: number;
}

interface Module {
  title: string;
  description: string;
  prerequisites: string[];
  difficulty: string;
  estimatedTime: number;
  lessons: Lesson[];
  order: number;
}

interface GenerateCourseStructureResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    modules: Module[];
    rawAIResponse: string;
  };
}

export const generateLessonContent = async (data: GenerateLessonContentRequest): Promise<GenerateLessonContentResponse> => {
  try {
    const response = await axios.post(`${API_URL}/generate-lesson`, data, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error generating lesson content:", error);
    throw error;
  }
};

export const enhanceContent = async (courseId: string): Promise<EnhanceContentResponse> => {
  try {
    const response = await axios.post(`${API_URL}/enhance-content/${courseId}`, {}, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error enhancing content:", error);
    throw error;
  }
};

export const generateCourseStructure = async (data: GenerateCourseStructureRequest): Promise<GenerateCourseStructureResponse> => {
  try {
    const response = await axios.post(`${API_URL}/generate-course-structure`, data, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error generating course structure:", error);
    throw error;
  }
};

export default {
  generateLessonContent,
  enhanceContent,
  generateCourseStructure,
};
