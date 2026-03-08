import { useState } from 'react';
import { Record } from '../types/record';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, Lock, AlertCircle } from 'lucide-react';
import { getTodayDate, isRecordLocked } from '../utils/recordUtils';

interface CreateTaskDialogProps {
  onCreateTask: (data: TaskFormData) => Promise<void>;
  developerName: string;
}

export interface TaskFormData {
  date: string;
  morningPlannedTasks: string;
  taskCategory: 'Dev' | 'Research' | 'Test' | 'Support';
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: number;
  actualWorkDone: string;
  completionStatus: number;
  taskLevel: 'Easy' | 'Medium' | 'Hard';
  blockers: string;
}

export function CreateTaskDialog({ onCreateTask, developerName }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayDate = getTodayDate();
  const [formData, setFormData] = useState<TaskFormData>({
    date: todayDate,
    morningPlannedTasks: '',
    taskCategory: 'Dev',
    priority: 'Medium',
    estimatedTime: 0,
    actualWorkDone: '',
    completionStatus: 0,
    taskLevel: 'Medium',
    blockers: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Always use today's date
      await onCreateTask({ ...formData, date: todayDate });
      setFormData({
        date: todayDate,
        morningPlannedTasks: '',
        taskCategory: 'Dev',
        priority: 'Medium',
        estimatedTime: 0,
        actualWorkDone: '',
        completionStatus: 0,
        taskLevel: 'Medium',
        blockers: '',
      });
      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Daily Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Daily Task</DialogTitle>
          <DialogDescription>
            Fill in your daily task details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#eff4ff] border border-[#c9d7ff] rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-[#0A2E8A] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#0A2E8A]">
              <p className="font-medium">Tasks can only be created for today's date.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={todayDate}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developerName">Developer Name</Label>
              <Input
                id="developerName"
                value={developerName}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="morningPlannedTasks">Morning Planned Tasks *</Label>
            <Textarea
              id="morningPlannedTasks"
              value={formData.morningPlannedTasks}
              onChange={(e) => setFormData({ ...formData, morningPlannedTasks: e.target.value })}
              placeholder="What are you planning to work on today?"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskCategory">Task Category *</Label>
              <select
                id="taskCategory"
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
              <Label htmlFor="priority">Priority *</Label>
              <select
                id="priority"
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

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (Hours) *</Label>
              <Input
                id="estimatedTime"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualWorkDone">Actual Work Done (EOD) *</Label>
            <Textarea
              id="actualWorkDone"
              value={formData.actualWorkDone}
              onChange={(e) => setFormData({ ...formData, actualWorkDone: e.target.value })}
              placeholder="What did you accomplish today?"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="completionStatus">Completion Status (%) *</Label>
              <Input
                id="completionStatus"
                type="number"
                min="0"
                max="100"
                value={formData.completionStatus}
                onChange={(e) => setFormData({ ...formData, completionStatus: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskLevel">Task Level *</Label>
              <select
                id="taskLevel"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockers">Blockers / Issues</Label>
            <Textarea
              id="blockers"
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              placeholder="Any blockers or issues you faced?"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Submit Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditTaskDialogProps {
  record: Record;
  onEditTask: (record: Record) => Promise<void>;
  canEdit: boolean;
  isAdmin: boolean;
  userEmail: string;
}

export function EditTaskDialog({ record, onEditTask, canEdit, isAdmin, userEmail }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record>({ ...record });
  const isLocked = isRecordLocked(record, userEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onEditTask(formData);
      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isLocked ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </>
          ) : (
            'Edit'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details.
          </DialogDescription>
        </DialogHeader>

        {isLocked && !isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Editing closed</p>
              <p>This task was created on a previous day and is now locked. Contact your admin to make changes.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-developerName">Developer Name</Label>
              <Input
                id="edit-developerName"
                value={formData.developerName}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-morningPlannedTasks">Morning Planned Tasks *</Label>
            <Textarea
              id="edit-morningPlannedTasks"
              value={formData.morningPlannedTasks}
              onChange={(e) => setFormData({ ...formData, morningPlannedTasks: e.target.value })}
              rows={3}
              required
              disabled={isLocked && !isAdmin}
              className={isLocked && !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-taskCategory">Task Category *</Label>
              <select
                id="edit-taskCategory"
                value={formData.taskCategory}
                onChange={(e) => setFormData({ ...formData, taskCategory: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isLocked && !isAdmin}
              >
                <option value="Dev">Dev</option>
                <option value="Research">Research</option>
                <option value="Test">Test</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority *</Label>
              <select
                id="edit-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isLocked && !isAdmin}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estimatedTime">Estimated Time (Hours) *</Label>
              <Input
                id="edit-estimatedTime"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 0 })}
                required
                disabled={isLocked && !isAdmin}
                className={isLocked && !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-actualWorkDone">Actual Work Done (EOD) *</Label>
            <Textarea
              id="edit-actualWorkDone"
              value={formData.actualWorkDone}
              onChange={(e) => setFormData({ ...formData, actualWorkDone: e.target.value })}
              rows={3}
              required
              disabled={isLocked && !isAdmin}
              className={isLocked && !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-completionStatus">Completion Status (%) *</Label>
              <Input
                id="edit-completionStatus"
                type="number"
                min="0"
                max="100"
                value={formData.completionStatus}
                onChange={(e) => setFormData({ ...formData, completionStatus: parseInt(e.target.value) || 0 })}
                required
                disabled={isLocked && !isAdmin}
                className={isLocked && !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-taskLevel">Task Level *</Label>
              <select
                id="edit-taskLevel"
                value={formData.taskLevel}
                onChange={(e) => setFormData({ ...formData, taskLevel: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isLocked && !isAdmin}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-blockers">Blockers / Issues</Label>
            <Textarea
              id="edit-blockers"
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              rows={2}
              disabled={isLocked && !isAdmin}
              className={isLocked && !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          {isAdmin && (
            <div className="space-y-2 bg-[#fff2ec] p-4 rounded-lg border border-[#ffd9c9]">
              <Label htmlFor="edit-managerRemarks">Manager Remarks (Admin Only)</Label>
              <Textarea
                id="edit-managerRemarks"
                value={formData.managerRemarks}
                onChange={(e) => setFormData({ ...formData, managerRemarks: e.target.value })}
                placeholder="Add manager feedback or remarks"
                rows={2}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || (isLocked && !isAdmin)}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
