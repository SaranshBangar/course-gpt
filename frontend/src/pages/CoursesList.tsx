
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '@/api/course';
import { getAllProgress } from '@/api/progress';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/components/courses/CourseCard';
import { Course, CourseProgress } from '@/types/types';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CoursesList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
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
          title: "Error loading courses",
          description: "Could not load your courses. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const findCourseProgress = (courseId?: string) => {
    if (!courseId) return null;
    return progress.find(p => p.course === courseId) || null;
  };

  const filterCourses = () => {
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
      
      return matchesSearch && matchesDifficulty;
    });
  };

  const filteredCourses = filterCourses();

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button asChild>
          <Link to="/create-course">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course}
              progress={findCourseProgress(course._id)}
            />
          ))}
        </div>
      ) : searchTerm || difficultyFilter !== 'all' ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No courses match your search criteria.</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setDifficultyFilter('all'); }}>
            Clear Filters
          </Button>
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

export default CoursesList;
