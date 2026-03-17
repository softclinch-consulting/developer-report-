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
    actualWorkDone: '',
    completionStatus: 0,
    taskLevel: 'Medium',
    blockers: '',
    blockerOwner: '',
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Write what you will work on today.</CardDescription>
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
                required
              />
              <p className="text-xs text-gray-500">
                Tip: Use one task per line (bullets work best).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Estimate and classify the work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planner-taskCategory">Task Category *</Label>
              <select
                id="planner-taskCategory"
                value={formData.taskCategory}
                onChange={(e) => setFormData({ ...formData, taskCategory: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="Dev">Dev</option>
                <option value="Research">Research</option>
                <option value="Test">Test</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-priority">Priority *</Label>
              <select
                id="planner-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="planner-estimatedTime">Estimated Time (Hours) *</Label>
                <Input
                  id="planner-estimatedTime"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planner-estimatedDays">Estimated Days *</Label>
                <Input
                  id="planner-estimatedDays"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-taskLevel">Task Level *</Label>
              <select
                id="planner-taskLevel"
                value={formData.taskLevel}
                onChange={(e) => setFormData({ ...formData, taskLevel: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-actualWorkDone">Actual Work Done (EOD) *</Label>
              <Textarea
                id="planner-actualWorkDone"
                value={formData.actualWorkDone}
                onChange={(e) => setFormData({ ...formData, actualWorkDone: e.target.value })}
                placeholder="Update this at end-of-day."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-completionStatus">Completion Status (%) *</Label>
              <Input
                id="planner-completionStatus"
                type="number"
                min="0"
                max="100"
                value={formData.completionStatus}
                onChange={(e) => setFormData({ ...formData, completionStatus: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-blockers">Blockers / Issues</Label>
              <Textarea
                id="planner-blockers"
                value={formData.blockers}
                onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                placeholder="Anything blocking you?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-blockerOwner">Assigned To Resolve Blocker / Error</Label>
              <Input
                id="planner-blockerOwner"
                value={formData.blockerOwner}
                onChange={(e) => setFormData({ ...formData, blockerOwner: e.target.value })}
                placeholder="Assignee name or email"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Submit Task'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
