
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateCourseStructure } from '@/api/ai';
import { createCourse } from '@/api/course';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const topics = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology',
  'Chemistry', 'History', 'Literature', 'Art', 'Music',
  'Economics', 'Psychology', 'Sociology', 'Philosophy',
  'Political Science', 'Geography', 'Astronomy', 'Geology',
];

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters' }),
  targetAudience: z.string().min(3, { message: 'Target audience must be at least 3 characters' }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

type FormData = z.infer<typeof formSchema>;

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      targetAudience: '',
      difficulty: 'beginner',
    },
  });

  const watchTopic = form.watch('topic');

  // Handle topic input changes to show suggestions
  React.useEffect(() => {
    if (watchTopic.length >= 2) {
      const filtered = topics.filter(topic => 
        topic.toLowerCase().includes(watchTopic.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [watchTopic]);

  const applyTopicSuggestion = (suggestion: string) => {
    form.setValue('topic', suggestion);
    setSuggestions([]);
  };

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Generate course structure using AI
      const response = await generateCourseStructure(data);
      
      if (response.success) {
        const courseData = {
          title: response.data.title,
          description: response.data.description,
          tags: data.topic.split(',').map(tag => tag.trim()),
          visibility: 'private' as const,
          difficulty: data.difficulty,
          modules: response.data.modules,
        };
        
        // Create the course in the database
        const courseResponse = await createCourse(courseData);
        
        if (courseResponse.success) {
          toast({
            title: "Course created!",
            description: "Your new course has been created successfully.",
          });
          navigate(`/courses/${courseResponse.data._id}`);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create course",
        description: "There was an error generating your course. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What topic would you like to create a course about?</FormLabel>
                    <FormDescription>
                      Be specific about the subject matter you want to cover.
                    </FormDescription>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Introduction to Machine Learning, Advanced Watercolor Techniques, History of Renaissance Art"
                          {...field}
                          className="resize-none h-24"
                        />
                      </FormControl>
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-popover rounded-md border shadow-lg animate-fade-in">
                          <ul className="py-1 max-h-60 overflow-auto">
                            {suggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                onClick={() => applyTopicSuggestion(suggestion)}
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who is this course for?</FormLabel>
                    <FormDescription>
                      Describe the intended audience and their background knowledge.
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g., College students, professionals, beginners with no prior knowledge"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Course...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isGenerating && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Generating your course...</h2>
            <p className="text-muted-foreground">Our AI is creating a structured curriculum based on your input</p>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-20 w-full" />
            
            <div className="space-y-2 mt-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            
            <div className="space-y-2 mt-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
