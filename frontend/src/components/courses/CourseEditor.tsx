
import React, { useState } from 'react';
import { Course, Module, Lesson } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { updateCourse } from '@/api/course';
import { generateLessonContent } from '@/api/ai';

interface CourseEditorProps {
  course: Course;
  onCourseUpdate: (updatedCourse: Course) => void;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({ course, onCourseUpdate }) => {
  const [editedCourse, setEditedCourse] = useState<Course>(course);
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingLesson, setRegeneratingLesson] = useState<{moduleIndex: number, lessonIndex: number} | null>(null);
  const { toast } = useToast();

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (moduleIndex: number, field: keyof Module, value: any) => {
    setEditedCourse((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], [field]: value };
      return { ...prev, modules: updatedModules };
    });
  };

  const handleLessonChange = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    setEditedCourse((prev) => {
      const updatedModules = [...prev.modules];
      const updatedLessons = [...updatedModules[moduleIndex].lessons];
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], [field]: value };
      updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], lessons: updatedLessons };
      return { ...prev, modules: updatedModules };
    });
  };

  const handleRegenerateLesson = async (moduleIndex: number, lessonIndex: number) => {
    try {
      setRegeneratingLesson({ moduleIndex, lessonIndex });
      
      const lesson = editedCourse.modules[moduleIndex].lessons[lessonIndex];
      
      const response = await generateLessonContent({
        topic: lesson.title,
        difficulty: editedCourse.difficulty,
      });
      
      if (response.success) {
        const generatedContent = response.data;
        
        setEditedCourse((prev) => {
          const updatedModules = [...prev.modules];
          const updatedLessons = [...updatedModules[moduleIndex].lessons];
          updatedLessons[lessonIndex] = { 
            ...updatedLessons[lessonIndex], 
            content: generatedContent.description,
            learningOutcomes: generatedContent.learningOutcomes,
            keyConcepts: generatedContent.keyConcepts,
            activities: generatedContent.activities,
          };
          updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], lessons: updatedLessons };
          return { ...prev, modules: updatedModules };
        });
        
        toast({
          title: "Content regenerated",
          description: "The lesson content has been updated with AI suggestions.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to regenerate content",
        description: "Please try again later",
      });
    } finally {
      setRegeneratingLesson(null);
    }
  };

  const handleSaveCourse = async () => {
    try {
      setIsSaving(true);
      
      if (!course._id) {
        throw new Error("Course ID is missing");
      }
      
      const response = await updateCourse(course._id, editedCourse);
      
      if (response.success) {
        onCourseUpdate(response.data);
        toast({
          title: "Course updated",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save course",
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Course</h2>
        <Button onClick={handleSaveCourse} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            name="title"
            value={editedCourse.title}
            onChange={handleCourseChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={editedCourse.description}
            onChange={handleCourseChange}
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-2">Course Modules</h3>
          
          <Accordion type="multiple" className="w-full" defaultValue={["module-0"]}>
            {editedCourse.modules.map((module, moduleIndex) => (
              <AccordionItem key={module._id || moduleIndex} value={`module-${moduleIndex}`} className="border rounded-md mb-4">
                <AccordionTrigger className="px-4">
                  <div className="text-left">
                    <span className="font-medium">{module.title}</span>
                    <p className="text-xs text-muted-foreground">{module.lessons.length} lessons</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`module-${moduleIndex}-title`}>Module Title</Label>
                      <Input
                        id={`module-${moduleIndex}-title`}
                        value={module.title}
                        onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`module-${moduleIndex}-description`}>Description</Label>
                      <Textarea
                        id={`module-${moduleIndex}-description`}
                        value={module.description}
                        onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <h4 className="font-medium pt-2">Lessons</h4>
                    
                    <Accordion type="multiple" className="w-full">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <AccordionItem key={lesson._id || lessonIndex} value={`lesson-${moduleIndex}-${lessonIndex}`} className="border rounded-md mb-2">
                          <AccordionTrigger className="px-4">
                            {lesson.title}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`lesson-${moduleIndex}-${lessonIndex}-title`}>Lesson Title</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`lesson-${moduleIndex}-${lessonIndex}-title`}
                                    value={lesson.title}
                                    onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleRegenerateLesson(moduleIndex, lessonIndex)}
                                    disabled={!!regeneratingLesson}
                                  >
                                    {regeneratingLesson?.moduleIndex === moduleIndex && 
                                     regeneratingLesson?.lessonIndex === lessonIndex ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`lesson-${moduleIndex}-${lessonIndex}-content`}>Content</Label>
                                <Textarea
                                  id={`lesson-${moduleIndex}-${lessonIndex}-content`}
                                  value={lesson.content}
                                  onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'content', e.target.value)}
                                  rows={4}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Learning Outcomes</Label>
                                <ul className="list-disc pl-5 space-y-1">
                                  {lesson.learningOutcomes?.map((outcome, i) => (
                                    <li key={i} className="text-sm">
                                      <Input 
                                        value={outcome} 
                                        onChange={(e) => {
                                          const newOutcomes = [...(lesson.learningOutcomes || [])];
                                          newOutcomes[i] = e.target.value;
                                          handleLessonChange(moduleIndex, lessonIndex, 'learningOutcomes', newOutcomes);
                                        }} 
                                        className="mt-1"
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Activities</Label>
                                <ul className="list-disc pl-5 space-y-1">
                                  {lesson.activities?.map((activity, i) => (
                                    <li key={i} className="text-sm">
                                      <Input 
                                        value={activity} 
                                        onChange={(e) => {
                                          const newActivities = [...(lesson.activities || [])];
                                          newActivities[i] = e.target.value;
                                          handleLessonChange(moduleIndex, lessonIndex, 'activities', newActivities);
                                        }} 
                                        className="mt-1"
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
