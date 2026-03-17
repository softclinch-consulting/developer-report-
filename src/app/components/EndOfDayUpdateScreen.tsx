import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckSquare2 } from 'lucide-react';
import { Record } from '../types/record';
import { isToday } from '../utils/recordUtils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface EndOfDayUpdateScreenProps {
  records: Record[];
  initialRecordId?: string;
  onUpdateTask: (record: Record) => Promise<void>;
  onBack: () => void;
}

export function EndOfDayUpdateScreen({ records, initialRecordId, onUpdateTask, onBack }: EndOfDayUpdateScreenProps) {
  const todaysRecords = useMemo(() => {
    const filtered = records.filter((r) => isToday(r.date));
    return filtered.sort((a, b) => new Date(b.createdTimestamp).getTime() - new Date(a.createdTimestamp).getTime());
  }, [records]);

  const [selectedId, setSelectedId] = useState<string>('');
  const selectedRecord = useMemo(
    () => todaysRecords.find((r) => r.id === selectedId) || null,
    [todaysRecords, selectedId]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Pick<Record, 'taskCategory' | 'priority' | 'estimatedTime' | 'estimatedDays' | 'taskLevel' | 'workModule' | 'actualWorkDone' | 'completionStatus' | 'blockers' | 'blockerOwner' | 'resolutionAction'>>({
    taskCategory: 'Dev',
    priority: 'Medium',
    estimatedTime: 0,
    estimatedDays: 1,
    taskLevel: 'Medium',
    workModule: '',
    actualWorkDone: '',
    completionStatus: 0,
    blockers: '',
    blockerOwner: '',
    resolutionAction: '',
  });

  useEffect(() => {
    const fallback = todaysRecords[0]?.id || '';
    const initial = initialRecordId && todaysRecords.some((r) => r.id === initialRecordId) ? initialRecordId : fallback;
    setSelectedId(initial);
  }, [initialRecordId, todaysRecords]);

  useEffect(() => {
    if (!selectedRecord) return;
    setFormData({
      taskCategory: selectedRecord.taskCategory || 'Dev',
      priority: selectedRecord.priority || 'Medium',
      estimatedTime: Number(selectedRecord.estimatedTime) || 0,
      estimatedDays: Number(selectedRecord.estimatedDays) || 1,
      taskLevel: selectedRecord.taskLevel || 'Medium',
      workModule: selectedRecord.workModule || '',
      actualWorkDone: selectedRecord.actualWorkDone || '',
      completionStatus: Number(selectedRecord.completionStatus) || 0,
      blockers: selectedRecord.blockers || '',
      blockerOwner: selectedRecord.blockerOwner || '',
      resolutionAction: selectedRecord.resolutionAction || '',
    });
  }, [selectedRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      await onUpdateTask({
        ...selectedRecord,
        taskCategory: formData.taskCategory,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime,
        estimatedDays: formData.estimatedDays,
        taskLevel: formData.taskLevel,
        workModule: formData.workModule,
        actualWorkDone: formData.actualWorkDone,
        completionStatus: formData.completionStatus,
        blockers: formData.blockers,
        blockerOwner: formData.blockerOwner,
        resolutionAction: formData.resolutionAction,
      });
      onBack();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">End-of-Day Update</h2>
          <p className="mt-1 text-sm text-gray-600">
            Mark today’s progress and submit your actual work done.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {todaysRecords.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No task for today</CardTitle>
            <CardDescription>Create today’s morning plan first, then come back for EOD update.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={onBack}>Go back</Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose task</CardTitle>
              <CardDescription>Select which of today’s entries you want to update.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eod-task">Today’s Tasks</Label>
                <select
                  id="eod-task"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {todaysRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      {new Date(r.createdTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {r.taskCategory} — {String(r.morningPlannedTasks || '').slice(0, 40)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRecord && (
                <div className="rounded-lg border bg-white p-3 text-sm">
                  <p className="font-semibold">Morning Plan</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">{selectedRecord.morningPlannedTasks || '-'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details + EOD</CardTitle>
              <CardDescription>Details are optional; EOD fields are required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="eod-taskCategory">Task Category</Label>
                  <select
                    id="eod-taskCategory"
                    value={formData.taskCategory}
                    onChange={(e) => setFormData({ ...formData, taskCategory: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Dev">Dev</option>
                    <option value="Research">Research</option>
                    <option value="Test">Test</option>
                    <option value="Support">Support</option>
                    <option value="Internal Meeting">Internal Meeting</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eod-priority">Priority</Label>
                  <select
                    id="eod-priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eod-taskLevel">Task Level</Label>
                  <select
                    id="eod-taskLevel"
                    value={formData.taskLevel}
                    onChange={(e) => setFormData({ ...formData, taskLevel: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eod-estimatedTime">Estimated Time (Hours)</Label>
                  <Input
                    id="eod-estimatedTime"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eod-estimatedDays">Estimated Days</Label>
                  <Input
                    id="eod-estimatedDays"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-workModule">Work Module</Label>
                <Input
                  id="eod-workModule"
                  value={formData.workModule || ''}
                  onChange={(e) => setFormData({ ...formData, workModule: e.target.value })}
                  placeholder="Example: Auth, Reports, Dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-actualWorkDone">Actual Work Done (EOD) *</Label>
                <Textarea
                  id="eod-actualWorkDone"
                  value={formData.actualWorkDone}
                  onChange={(e) => setFormData({ ...formData, actualWorkDone: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-completionStatus">Completion Status (%) *</Label>
                <Input
                  id="eod-completionStatus"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completionStatus}
                  onChange={(e) => setFormData({ ...formData, completionStatus: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-blockers">Blockers / Issues</Label>
                <Textarea
                  id="eod-blockers"
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-resolutionAction">Resolution Action</Label>
                <select
                  id="eod-resolutionAction"
                  value={formData.resolutionAction}
                  onChange={(e) => setFormData({ ...formData, resolutionAction: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select</option>
                  <option value="Resolve">Resolve</option>
                  <option value="Need Help">Get Help</option>
                  <option value="Alternative">Alternative</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eod-blockerOwner">Assigned To Resolve Blocker / Error</Label>
                <Input
                  id="eod-blockerOwner"
                  value={formData.blockerOwner}
                  onChange={(e) => setFormData({ ...formData, blockerOwner: e.target.value })}
                  placeholder="Assignee name or email"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedRecord}>
                  <CheckSquare2 className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit EOD Update'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
