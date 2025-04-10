import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getProgressHistory, ProgressHistoryItem } from "@/api/progress";

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
  const [data, setData] = useState<ProgressHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = async () => {
    if (!courseId) {
      // Generate demo data if no courseId is provided
      const demoData = generateDemoData();
      setData(demoData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const progressData = await getProgressHistory(courseId);
      setData(progressData);
      setError(null);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Unable to load progress data");

      // Fall back to demo data in case of error
      const demoData = generateDemoData();
      setData(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Generate demo data for preview or when real data isn't available
  const generateDemoData = (): ProgressHistoryItem[] => {
    const today = new Date();
    const demoData: ProgressHistoryItem[] = [];

    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      // Create a realistic learning curve
      let progress = 0;
      if (i <= 14) progress = Math.min(100, Math.round(Math.pow(14 - i, 1.5) * 1.8));

      demoData.push({
        date: dateString,
        progress: progress,
      });
    }

    return demoData;
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
        ) : error && data.length === 0 ? (
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
