import React, { useState } from "react";
import { Course, CourseProgress, Module, Lesson } from "@/types/types";
import { ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { markLessonComplete } from "@/api/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LessonTreeProps {
  course: Course;
  progress: CourseProgress;
  onLessonSelect: (moduleIndex: number, lessonIndex: number) => void;
  selectedModule: number;
  selectedLesson: number;
}

export const LessonTree: React.FC<LessonTreeProps> = ({ course, progress, onLessonSelect, selectedModule, selectedLesson }) => {
  const [expandedModules, setExpandedModules] = useState<number[]>([selectedModule]);
  const { toast } = useToast();

  const toggleModule = (moduleIndex: number) => {
    setExpandedModules((prev) => {
      if (prev.includes(moduleIndex)) {
        return prev.filter((i) => i !== moduleIndex);
      } else {
        return [...prev, moduleIndex];
      }
    });
  };

  const handleCheckLesson = async (moduleIndex: number, lessonIndex: number, lessonId?: string) => {
    if (!lessonId) return;

    try {
      const isCompleted = progress.completedLessons.includes(lessonId);

      // Optimistically update the UI
      const newCompletedLessons = isCompleted ? progress.completedLessons.filter((id) => id !== lessonId) : [...progress.completedLessons, lessonId];

      await markLessonComplete(course._id as string, lessonId);

      toast({
        title: isCompleted ? "Lesson marked as incomplete" : "Lesson completed",
        description: "Your progress has been updated",
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update progress",
        description: "Please try again later",
      });
    }
  };

  const isLessonCompleted = (lessonId?: string) => {
    return lessonId ? progress.completedLessons.includes(lessonId) : false;
  };

  return (
    <div className="w-full">
      <div className="text-sm font-medium mb-2">Course Content</div>
      <div className="space-y-1">
        {course.modules.map((module: Module, moduleIndex: number) => (
          <div key={module._id || moduleIndex} className="border rounded-md overflow-hidden">
            <div
              className={cn(
                "flex items-center justify-between p-3 cursor-pointer hover:bg-secondary",
                moduleIndex === selectedModule && expandedModules.includes(moduleIndex) && "bg-secondary"
              )}
              onClick={() => toggleModule(moduleIndex)}
            >
              <div className="flex items-center gap-2">
                {expandedModules.includes(moduleIndex) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span>{module.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{module.lessons.length} lessons</span>
            </div>

            {expandedModules.includes(moduleIndex) && (
              <div className="bg-background border-t">
                {module.lessons.map((lesson: Lesson, lessonIndex: number) => (
                  <div
                    key={lesson._id || lessonIndex}
                    className={cn(
                      "flex items-center p-2 pl-8 hover:bg-secondary/50 cursor-pointer",
                      moduleIndex === selectedModule && lessonIndex === selectedLesson && "bg-secondary"
                    )}
                  >
                    <div
                      className="p-1 rounded-sm hover:bg-accent mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckLesson(moduleIndex, lessonIndex, lesson._id);
                      }}
                    >
                      {isLessonCompleted(lesson._id) ? (
                        <CheckCircle className="h-4 w-4 text-primary animate-fade-in" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1" onClick={() => onLessonSelect(moduleIndex, lessonIndex)}>
                      <span className={cn("text-sm", isLessonCompleted(lesson._id) && "text-muted-foreground")}>{lesson.topic}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
