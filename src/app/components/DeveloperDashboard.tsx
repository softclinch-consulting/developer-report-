import { useState, useEffect } from 'react';
import { Record, User } from '../types/record';
import {
  canEditRecord,
} from '../utils/recordUtils';
import { CreateTaskDialog, EditTaskDialog, TaskFormData } from './TaskDialogs';
import { createTask, deleteTask, fetchTasks, updateTask } from '../services/appsScriptApi';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface DeveloperDashboardProps {
  user: User;
  onLogout: () => void;
}

export function DeveloperDashboard({ user, onLogout }: DeveloperDashboardProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [myRecords, setMyRecords] = useState<Record[]>([]);

  useEffect(() => {
    loadRecords().catch((error) => {
      alert(error instanceof Error ? error.message : 'Failed to load tasks');
    });
  }, [user.email]);

  const loadRecords = async () => {
    const allRecords = await fetchTasks(user);
    const filtered = allRecords.filter((r) => r.assignedEmail === user.email);
    setRecords(allRecords);
    setMyRecords(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask(user, data);
    await loadRecords();
  };

  const handleEditTask = async (updatedRecord: Record) => {
    if (!canEditRecord(updatedRecord, user.email, false)) {
      alert('You can edit only your own tasks created today. Previous-day tasks are locked.');
      return;
    }
    await updateTask(user, updatedRecord);
    await loadRecords();
  };

  const handleDeleteTask = async (record: Record) => {
    if (!canEditRecord(record, user.email, false)) {
      alert('You can delete only your own tasks created today. Previous-day tasks are locked.');
      return;
    }
    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteTask(user, record.id);
      await loadRecords();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionColor = (status: number) => {
    if (status >= 100) return 'text-green-600';
    if (status >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BrandLogo size="sm" showWordmark={false} />
              <div>
                <h1 className="text-lg font-semibold">Developer Task Tracker</h1>
                <p className="text-sm text-gray-500">Developer Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">{user.email}</p>
                <Badge variant="secondary" className="text-xs">
                  Developer
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{myRecords.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                {myRecords.filter(r => r.completionStatus >= 100).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <Clock className="w-6 h-6 mr-2 text-yellow-600" />
                {myRecords.filter(r => r.completionStatus < 100).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  Daily tasks assigned to {user.email}
                </CardDescription>
              </div>
              <CreateTaskDialog 
                onCreateTask={handleCreateTask} 
                developerName={user.email.split('@')[0]}
              />
            </div>
          </CardHeader>
          <CardContent>
            {myRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No tasks found</p>
                <p className="text-sm text-gray-400">
                  Click "Add Daily Task" to create your first entry
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Planned Tasks</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Blocker Owner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{record.morningPlannedTasks}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.taskCategory}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(record.priority)}>
                            {record.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.estimatedDays}</TableCell>
                        <TableCell className={getCompletionColor(record.completionStatus)}>
                          {record.completionStatus}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{record.taskLevel}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{record.blockerOwner || '-'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditTaskDialog
                              record={record}
                              onEditTask={handleEditTask}
                              canEdit={record.assignedEmail === user.email}
                              isAdmin={false}
                              userEmail={user.email}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(record)}
                              disabled={!canEditRecord(record, user.email, false)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
