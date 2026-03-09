import { useState, useEffect } from 'react';
import { Record as TaskRecord, User } from '../types/record';
import {
  canEditRecord,
  downloadCSV,
} from '../utils/recordUtils';
import { EditTaskDialog } from './TaskDialogs';
import { deleteTask, fetchTasks, updateTask } from '../services/appsScriptApi';
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
import { Input } from './ui/input';
import { LogOut, Download, Users, ListTodo, TrendingUp, Trash2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [records, setRecords] = useState<TaskRecord[]>([]);
  const [filterEmail, setFilterEmail] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadRecords().catch((error) => {
      alert(error instanceof Error ? error.message : 'Failed to load tasks');
    });
  }, [user.email]);

  const loadRecords = async () => {
    const allRecords = await fetchTasks(user);
    setRecords(allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleEditTask = async (updatedRecord: TaskRecord) => {
    await updateTask(user, updatedRecord);
    await loadRecords();
  };

  const handleDownloadCSV = () => {
    downloadCSV(filteredRecords);
  };

  const handleQuickRemarkUpdate = async (recordId: string, remark: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    await updateTask(user, { ...record, managerRemarks: remark });
    await loadRecords();
  };

  const handleRemarkInput = (recordId: string, remark: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId ? { ...record, managerRemarks: remark } : record
      )
    );
  };

  const handleDeleteTask = async (record: TaskRecord) => {
    const confirmed = window.confirm(
      `Delete task for ${record.assignedEmail} on ${new Date(record.date).toLocaleDateString()}? This action cannot be undone.`
    );
    if (!confirmed) return;
    await deleteTask(user, record.id);
    await loadRecords();
  };

  // Group records by assigned email
  const recordsByUser = records.reduce((acc, record) => {
    if (!acc[record.assignedEmail]) {
      acc[record.assignedEmail] = [];
    }
    acc[record.assignedEmail].push(record);
    return acc;
  }, {} as { [key: string]: TaskRecord[] });

  const filteredRecords = records.filter((r) => {
    const emailMatch = !filterEmail || r.assignedEmail.toLowerCase().includes(filterEmail.toLowerCase());
    const nameMatch = !filterName || r.developerName.toLowerCase().includes(filterName.toLowerCase());
    const dateMatch = !filterDate || toDateKey(r.date) === filterDate;
    return emailMatch && nameMatch && dateMatch;
  });

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

  const toDateKey = (value: string): string => {
    const raw = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const totalTasks = records.length;
  const completedTasks = records.filter(r => r.completionStatus >= 100).length;
  const avgCompletion = records.length > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.completionStatus, 0) / records.length)
    : 0;

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
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">{user.email}</p>
                <Badge className="text-xs bg-[#A93300] text-white">Admin</Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center">
                <ListTodo className="w-4 h-4 mr-2" />
                Total Tasks
              </CardDescription>
              <CardTitle className="text-3xl">{totalTasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Active Developers
              </CardDescription>
              <CardTitle className="text-3xl">
                {Object.keys(recordsByUser).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Avg Completion
              </CardDescription>
              <CardTitle className="text-3xl">{avgCompletion}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Export Data</CardDescription>
              <Button
                onClick={handleDownloadCSV}
                disabled={filteredRecords.length === 0}
                className="mt-2 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Developer Tasks</CardTitle>
                <CardDescription>
                  View and manage all task entries across the system
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-44"
                />
                <Input
                  placeholder="Filter by name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full sm:w-52"
                />
                <Input
                  placeholder="Filter by email..."
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {filterEmail || filterName || filterDate
                    ? 'No tasks found for selected filters'
                    : 'No tasks in the system'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead>Planned Tasks</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blocker Owner</TableHead>
                      <TableHead>Manager Remarks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{record.developerName}</span>
                            <Badge variant="outline" className="text-xs w-fit mt-1">
                              {record.assignedEmail}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm">{record.morningPlannedTasks}</div>
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
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm">{record.blockerOwner || '-'}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <Input
                            value={record.managerRemarks}
                            onChange={(e) => handleRemarkInput(record.id, e.target.value)}
                            onBlur={(e) => handleQuickRemarkUpdate(record.id, e.target.value)}
                            placeholder="Add remarks..."
                            className="text-sm h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditTaskDialog
                              record={record}
                              onEditTask={handleEditTask}
                              canEdit={canEditRecord(record, user.email, true)}
                              isAdmin={true}
                              userEmail={user.email}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(record)}
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
