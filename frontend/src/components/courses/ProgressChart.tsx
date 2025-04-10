import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Data structure for progress over time
interface ProgressDataPoint {
  date: string;
  progress: number;
}

interface ProgressChartProps {
  courseId?: string;
  userId?: string;
  title?: string;
  refreshInterval?: number; // in milliseconds
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  courseId,
  userId,
  title = "Learning Progress",
  refreshInterval = 30000, // Default to 30 seconds
}) => {
  const [data, setData] = useState<ProgressDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // Replace this URL with your actual API endpoint
      const url = `/api/progress${courseId ? `/course/${courseId}` : ""}${userId ? `/user/${userId}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }

      const progressData = await response.json();
      setData(progressData);
      setError(null);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Unable to load progress data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately on mount
    fetchProgressData();

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchProgressData, refreshInterval);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [courseId, userId, refreshInterval]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="h-[200px] flex items-center justify-center text-destructive">{error}</div>
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">No progress data available yet</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickMargin={10} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, "Progress"]} labelFormatter={(label) => `Date: ${label}`} />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
