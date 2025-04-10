import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourse } from "@/api/course";
import { getProgress } from "@/api/progress";
import { useToast } from "@/hooks/use-toast";
import { Course, CourseProgress, Lesson, Module } from "@/types/types";
import { LessonTree } from "@/components/courses/LessonTree";
import { CourseEditor } from "@/components/courses/CourseEditor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Edit, HistoryIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [activeTab, setActiveTab] = useState("lesson");
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!courseId) return;

      setIsLoading(true);
      try {
        const [courseResponse, progressResponse] = await Promise.all([getCourse(courseId), getProgress(courseId)]);

        if (courseResponse.success && progressResponse.success) {
          setCourse(courseResponse.data);
          setProgress(progressResponse.data);

          // Set selected module and lesson from progress
          setSelectedModule(progressResponse.data.currentModule);
          setSelectedLesson(progressResponse.data.currentLesson);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading course",
          description: "Could not load the course. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId]);

  const handleLessonSelect = (moduleIndex: number, lessonIndex: number) => {
    setSelectedModule(moduleIndex);
    setSelectedLesson(lessonIndex);
  };

  const handleCourseUpdate = (updatedCourse: Course) => {
    setCourse(updatedCourse);
  };

  const getCurrentLesson = (): Lesson | null => {
    if (!course) return null;

    const currentModule = course.modules[selectedModule];
    if (!currentModule) return null;

    return currentModule.lessons[selectedLesson] || null;
  };

  const currentLesson = getCurrentLesson();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] md:col-span-1" />
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || !progress) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="text-muted-foreground">The requested course could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setActiveTab(activeTab === "edit" ? "lesson" : "edit")}
          >
            {activeTab === "edit" ? "View Lesson" : "Edit Course"}
            {activeTab === "edit" ? null : <Edit className="h-4 w-4 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon">
            <HistoryIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lesson">Lesson</TabsTrigger>
          <TabsTrigger value="edit">Edit Course</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded-lg p-4">
              <LessonTree
                course={course}
                progress={progress}
                onLessonSelect={handleLessonSelect}
                selectedModule={selectedModule}
                selectedLesson={selectedLesson}
              />
            </div>

            <div className="md:col-span-2">
              {currentLesson ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{currentLesson.title}</h2>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Estimated time: {course.modules[selectedModule].estimatedTime} minutes</span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p>{currentLesson.content}</p>
                  </div>

                  {currentLesson.learningOutcomes && currentLesson.learningOutcomes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Learning Outcomes</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {currentLesson.learningOutcomes.map((outcome, i) => (
                          <li key={i} className="text-sm">
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentLesson.activities && currentLesson.activities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Activities</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {currentLesson.activities.map((activity, i) => (
                          <li key={i} className="text-sm">
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <Button
                      variant="outline"
                      disabled={selectedLesson === 0 && selectedModule === 0}
                      onClick={() => {
                        if (selectedLesson > 0) {
                          handleLessonSelect(selectedModule, selectedLesson - 1);
                        } else if (selectedModule > 0) {
                          const prevModuleIndex = selectedModule - 1;
                          const prevLessonIndex = course.modules[prevModuleIndex].lessons.length - 1;
                          handleLessonSelect(prevModuleIndex, prevLessonIndex);
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={selectedModule === course.modules.length - 1 && selectedLesson === course.modules[selectedModule].lessons.length - 1}
                      onClick={() => {
                        if (selectedLesson < course.modules[selectedModule].lessons.length - 1) {
                          handleLessonSelect(selectedModule, selectedLesson + 1);
                        } else if (selectedModule < course.modules.length - 1) {
                          handleLessonSelect(selectedModule + 1, 0);
                        }
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a lesson to view content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <CourseEditor course={course} onCourseUpdate={handleCourseUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetail;
