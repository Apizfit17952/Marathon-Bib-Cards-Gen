import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressPanelProps {
  isVisible: boolean;
  progress: number;
  stage: string;
  description: string;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  isVisible,
  progress,
  stage,
  description
}) => {
  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg capitalize">{stage}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};