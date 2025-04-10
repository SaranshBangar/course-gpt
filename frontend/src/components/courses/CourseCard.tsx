import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Course, CourseProgress } from "@/types/types";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface CourseCardProps {
  course: Course;
  progress?: CourseProgress;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, progress }) => {
  const formattedDate = course.updatedAt ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true }) : "Never";

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg tracking-tight">{course.title}</h3>
            <p className="text-sm text-muted-foreground">{course.difficulty}</p>
          </div>
          {progress && (
            <div className="relative h-14 w-14">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle className="text-muted stroke-2" cx="50" cy="50" r="40" fill="none" strokeWidth="8" />
                <circle
                  className="text-primary stroke-2"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.progressPercentage / 100)}`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" className="fill-primary">
                  {Math.round(progress.progressPercentage)}%
                </text>
              </svg>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm line-clamp-2">{course.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {course.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="inline-flex items-center bg-secondary text-xs font-medium rounded-full px-2.5 py-0.5">
              {tag}
            </span>
          ))}
          {course.tags && course.tags.length > 3 && (
            <span className="inline-flex items-center bg-secondary text-xs font-medium rounded-full px-2.5 py-0.5">+{course.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Updated {formattedDate}</span>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link to={`/courses/${course._id}`}>
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
