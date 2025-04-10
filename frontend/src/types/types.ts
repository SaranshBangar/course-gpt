
// Auth Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  settings: UserSettings;
  courses?: string[];
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  defaultDifficulty: "beginner" | "intermediate" | "advanced";
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Course Types
export interface Lesson {
  _id?: string;
  title: string;
  content: string;
  resources: string[];
  order: number;
  learningOutcomes?: string[];
  keyConcepts?: string[];
  activities?: string[];
}

export interface Module {
  _id?: string;
  title: string;
  description: string;
  prerequisites: string[];
  difficulty: string;
  estimatedTime: number;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  _id?: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
  visibility: "private" | "public";
  difficulty: "beginner" | "intermediate" | "advanced";
  modules: Module[];
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Progress Types
export interface CourseProgress {
  _id?: string;
  user: string;
  course: string;
  currentModule: number;
  currentLesson: number;
  completedLessons: string[];
  progressPercentage: number;
  lastAccessed?: Date;
}

// AI Generation Types
export interface GenerateCourseStructureRequest {
  topic: string;
  targetAudience: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface GenerateLessonContentRequest {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}
