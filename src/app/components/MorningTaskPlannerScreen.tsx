import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarDays, User as UserIcon } from 'lucide-react';
import { getTodayDate } from '../utils/recordUtils';
import { TaskFormData } from './TaskDialogs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface MorningTaskPlannerScreenProps {
  developerName: string;
  onCreateTask: (data: TaskFormData) => Promise<void>;
  onBack: () => void;
}

export function MorningTaskPlannerScreen({ developerName, onCreateTask, onBack }: MorningTaskPlannerScreenProps) {
  const todayDate = useMemo(() => getTodayDate(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    date: todayDate,
    morningPlannedTasks: '',
    taskCategory: 'Dev',
    priority: 'Medium',
    estimatedTime: 0,
    estimatedDays: 1,
    workModule: '',
    actualWorkDone: '',
    completionStatus: 0,
    taskLevel: 'Medium',
    blockers: '',
    blockerOwner: '',
    resolutionAction: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateTask({ ...formData, date: todayDate });
      onBack();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Morning Task Planner</h2>
          <p className="mt-1 text-sm text-gray-600">
            Plan your day in the morning, then update your actual work at end-of-day.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="rounded-lg border border-[#c9d7ff] bg-[#eff4ff] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0A2E8A]" />
          <div className="text-sm text-[#0A2E8A]">
            <p className="font-medium">Tasks can only be created for today.</p>
            <p className="mt-1">
              Date is locked to <span className="font-semibold">{todayDate}</span>.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Write what you will work on today (EOD details will be filled separately).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planner-date">Date *</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="planner-date"
                    type="date"
                    value={todayDate}
                    disabled
                    className="bg-gray-100 pl-10 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planner-developerName">Developer</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="planner-developerName"
                    value={developerName}
                    disabled
                    className="bg-gray-50 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-morningPlannedTasks">Morning Planned Tasks *</Label>
              <Textarea
                id="planner-morningPlannedTasks"
                value={formData.morningPlannedTasks}
                onChange={(e) => setFormData({ ...formData, morningPlannedTasks: e.target.value })}
                placeholder={"Example:\n- Fix login redirect bug\n- Review PR #123\n- Investigate flaky tests"}
                rows={6}
                className="min-h-[180px] resize-y"
                required
              />
              <p className="text-xs text-gray-500">
                Tip: Use one task per line (bullets work best).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Submit Morning Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
