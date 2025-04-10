
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '@/api/course';
import { getAllProgress } from '@/api/progress';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/components/courses/CourseCard';
import { ProgressChart } from '@/components/courses/ProgressChart';
import { Course, CourseProgress } from '@/types/types';
import { PlusCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesResponse, progressResponse] = await Promise.all([
          getCourses(),
          getAllProgress()
        ]);

        if (coursesResponse.success && progressResponse.success) {
          setCourses(coursesResponse.data);
          setProgress(progressResponse.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Could not load your courses. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate mock progress data for the chart
  const mockProgressData = [
    { date: 'Mon', progress: 10 },
    { date: 'Tue', progress: 25 },
    { date: 'Wed', progress: 30 },
    { date: 'Thu', progress: 45 },
    { date: 'Fri', progress: 60 },
    { date: 'Sat', progress: 75 },
    { date: 'Sun', progress: 90 },
  ];

  const findCourseProgress = (courseId?: string) => {
    if (!courseId) return null;
    return progress.find(p => p.course === courseId) || null;
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/create-course">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="md:col-span-2 lg:col-span-3">
          <ProgressChart data={mockProgressData} />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course}
              progress={findCourseProgress(course._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
          <Button asChild>
            <Link to="/create-course">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first course
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
