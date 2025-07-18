import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Archive,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  Trash2,
  Eye,
  Copy,
  Search,
  Filter,
  Calendar,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  FileText,
  Database,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface BackupItem {
  id: string;
  name: string;
  type: "full" | "incremental" | "schema_only" | "data_only";
  status: "completed" | "running" | "failed" | "pending" | "cancelled";
  progress?: number;
  size: number;
  compressed: boolean;
  classes: string[];
  createdAt: string;
  completedAt?: string;
  duration?: number;
  location: string;
  checksum: string;
  metadata: {
    objectCount: number;
    schemaCount: number;
    errors?: string[];
    warnings?: string[];
  };
  schedule?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    retention: number;
  };
}

interface RestoreJob {
  id: string;
  backupId: string;
  status: "running" | "completed" | "failed" | "pending";
  progress: number;
  startedAt: string;
  completedAt?: string;
  restoreMode: "overwrite" | "merge" | "skip_existing";
  selectedClasses: string[];
}

export default function Backup() {
  const { toast } = useToast();

  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: "backup-001",
      name: "Daily Full Backup",
      type: "full",
      status: "completed",
      size: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
      compressed: true,
      classes: ["Article", "Person", "Company"],
      createdAt: "2024-01-20T02:00:00Z",
      completedAt: "2024-01-20T02:45:00Z",
      duration: 45 * 60, // 45 minutes
      location: "s3://weaviate-backups/daily/backup-001.tar.gz",
      checksum:
        "sha256:d4a7c8f5e9b2a1c3d6e8f7a9b2c4d5e6f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      metadata: {
        objectCount: 125643,
        schemaCount: 8,
      },
      schedule: {
        enabled: true,
        frequency: "daily",
        retention: 30,
      },
    },
    {
      id: "backup-002",
      name: "Schema Backup",
      type: "schema_only",
      status: "completed",
      size: 1.2 * 1024 * 1024, // 1.2 MB
      compressed: true,
      classes: ["Article", "Person", "Company"],
      createdAt: "2024-01-19T14:30:00Z",
      completedAt: "2024-01-19T14:31:00Z",
      duration: 60, // 1 minute
      location: "s3://weaviate-backups/schema/backup-002.json",
      checksum:
        "sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
      metadata: {
        objectCount: 0,
        schemaCount: 8,
      },
    },
    {
      id: "backup-003",
      name: "Manual Backup - Pre Migration",
      type: "full",
      status: "running",
      progress: 67,
      size: 0,
      compressed: true,
      classes: ["Article", "Person"],
      createdAt: "2024-01-21T10:15:00Z",
      location: "s3://weaviate-backups/manual/backup-003.tar.gz",
      checksum: "",
      metadata: {
        objectCount: 0,
        schemaCount: 0,
      },
    },
    {
      id: "backup-004",
      name: "Weekly Full Backup",
      type: "full",
      status: "failed",
      size: 0,
      compressed: true,
      classes: ["Article", "Person", "Company"],
      createdAt: "2024-01-15T01:00:00Z",
      location: "s3://weaviate-backups/weekly/backup-004.tar.gz",
      checksum: "",
      metadata: {
        objectCount: 0,
        schemaCount: 0,
        errors: ["Connection timeout to S3", "Insufficient storage space"],
      },
      schedule: {
        enabled: true,
        frequency: "weekly",
        retention: 12,
      },
    },
  ]);

  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([
    {
      id: "restore-001",
      backupId: "backup-001",
      status: "completed",
      progress: 100,
      startedAt: "2024-01-21T09:00:00Z",
      completedAt: "2024-01-21T09:30:00Z",
      restoreMode: "overwrite",
      selectedClasses: ["Article", "Person"],
    },
  ]);

  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackupDetail, setShowBackupDetail] = useState(false);
  const [showScheduleBackup, setShowScheduleBackup] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);

  // Form states
  const [backupForm, setBackupForm] = useState({
    name: "",
    type: "full" as BackupItem["type"],
    compressed: true,
    classes: [] as string[],
    description: "",
    location: "s3://weaviate-backups/manual/",
  });

  const [restoreForm, setRestoreForm] = useState({
    backupId: "",
    mode: "overwrite" as RestoreJob["restoreMode"],
    classes: [] as string[],
    validateBeforeRestore: true,
    createMissingSchema: true,
  });

  const [scheduleForm, setScheduleForm] = useState({
    enabled: true,
    frequency: "daily" as "daily" | "weekly" | "monthly",
    retention: 30,
    backupType: "full" as BackupItem["type"],
    classes: [] as string[],
    time: "02:00",
  });

  const availableClasses = ["Article", "Person", "Company"];

  // Filter backups
  const filteredBackups = backups.filter((backup) => {
    const matchesSearch =
      backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || backup.status === statusFilter;

    const matchesType = typeFilter === "all" || backup.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Create backup
  const createBackup = async () => {
    if (!backupForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Backup name is required",
        variant: "destructive",
      });
      return;
    }

    const newBackup: BackupItem = {
      id: `backup-${Date.now()}`,
      name: backupForm.name,
      type: backupForm.type,
      status: "running",
      progress: 0,
      size: 0,
      compressed: backupForm.compressed,
      classes:
        backupForm.classes.length > 0 ? backupForm.classes : availableClasses,
      createdAt: new Date().toISOString(),
      location: `${backupForm.location}backup-${Date.now()}.tar.gz`,
      checksum: "",
      metadata: {
        objectCount: 0,
        schemaCount: 0,
      },
    };

    setBackups([newBackup, ...backups]);
    setBackupForm({
      name: "",
      type: "full",
      compressed: true,
      classes: [],
      description: "",
      location: "s3://weaviate-backups/manual/",
    });
    setShowCreateBackup(false);

    // Simulate backup progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setBackups((prev) =>
          prev.map((b) =>
            b.id === newBackup.id
              ? {
                  ...b,
                  status: "completed" as const,
                  progress: 100,
                  completedAt: new Date().toISOString(),
                  duration: Math.floor(Math.random() * 3600), // Random duration
                  size: Math.floor(Math.random() * 5 * 1024 * 1024 * 1024), // Random size up to 5GB
                  checksum:
                    "sha256:" + Math.random().toString(36).substring(2, 66),
                  metadata: {
                    objectCount: Math.floor(Math.random() * 200000),
                    schemaCount: availableClasses.length,
                  },
                }
              : b,
          ),
        );

        toast({
          title: "Backup Completed",
          description: `"${newBackup.name}" has been successfully created`,
        });
      } else {
        setBackups((prev) =>
          prev.map((b) => (b.id === newBackup.id ? { ...b, progress } : b)),
        );
      }
    }, 1000);

    toast({
      title: "Backup Started",
      description: `"${newBackup.name}" backup has been initiated`,
    });
  };

  // Start restore
  const startRestore = () => {
    if (!restoreForm.backupId) {
      toast({
        title: "Validation Error",
        description: "Please select a backup to restore",
        variant: "destructive",
      });
      return;
    }

    const backup = backups.find((b) => b.id === restoreForm.backupId);
    if (!backup) return;

    const newRestore: RestoreJob = {
      id: `restore-${Date.now()}`,
      backupId: restoreForm.backupId,
      status: "running",
      progress: 0,
      startedAt: new Date().toISOString(),
      restoreMode: restoreForm.mode,
      selectedClasses:
        restoreForm.classes.length > 0 ? restoreForm.classes : backup.classes,
    };

    setRestoreJobs([newRestore, ...restoreJobs]);
    setRestoreForm({
      backupId: "",
      mode: "overwrite",
      classes: [],
      validateBeforeRestore: true,
      createMissingSchema: true,
    });
    setShowRestoreBackup(false);

    // Simulate restore progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setRestoreJobs((prev) =>
          prev.map((r) =>
            r.id === newRestore.id
              ? {
                  ...r,
                  status: "completed" as const,
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : r,
          ),
        );

        toast({
          title: "Restore Completed",
          description: `Data from "${backup.name}" has been successfully restored`,
        });
      } else {
        setRestoreJobs((prev) =>
          prev.map((r) => (r.id === newRestore.id ? { ...r, progress } : r)),
        );
      }
    }, 1500);

    toast({
      title: "Restore Started",
      description: `Restoring data from "${backup.name}"`,
    });
  };

  // Delete backup
  const deleteBackup = () => {
    if (!backupToDelete) return;

    setBackups(backups.filter((b) => b.id !== backupToDelete));
    setBackupToDelete(null);
    setShowDeleteConfirm(false);

    toast({
      title: "Backup Deleted",
      description: "Backup has been permanently removed",
    });
  };

  // Cancel running backup
  const cancelBackup = (backupId: string) => {
    setBackups(
      backups.map((b) =>
        b.id === backupId ? { ...b, status: "cancelled" as const } : b,
      ),
    );

    toast({
      title: "Backup Cancelled",
      description: "Backup operation has been cancelled",
    });
  };

  // Get status icon
  const getStatusIcon = (status: string, progress?: number) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "full":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "incremental":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "schema_only":
        return "bg-green-100 text-green-800 border-green-200";
      case "data_only":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Backup & Restore
            </h1>
            <p className="text-muted-foreground mt-2">
              Create backups and restore Weaviate data
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={showScheduleBackup}
              onOpenChange={setShowScheduleBackup}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Backup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Automated Backup</DialogTitle>
                  <DialogDescription>
                    Configure automated backup schedules
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={scheduleForm.enabled}
                      onCheckedChange={(checked) =>
                        setScheduleForm({ ...scheduleForm, enabled: checked })
                      }
                    />
                    <Label>Enable Scheduled Backups</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={scheduleForm.frequency}
                        onValueChange={(value: any) =>
                          setScheduleForm({ ...scheduleForm, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Backup Type</Label>
                      <Select
                        value={scheduleForm.backupType}
                        onValueChange={(value: any) =>
                          setScheduleForm({
                            ...scheduleForm,
                            backupType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Backup</SelectItem>
                          <SelectItem value="incremental">
                            Incremental
                          </SelectItem>
                          <SelectItem value="schema_only">
                            Schema Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Retention (days)</Label>
                      <Input
                        type="number"
                        value={scheduleForm.retention}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            retention: parseInt(e.target.value) || 30,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowScheduleBackup(false)}
                    >
                      Cancel
                    </Button>
                    <Button>Save Schedule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showRestoreBackup}
              onOpenChange={setShowRestoreBackup}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Restore from Backup</DialogTitle>
                  <DialogDescription>
                    Restore data from an existing backup
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Backup</Label>
                    <Select
                      value={restoreForm.backupId}
                      onValueChange={(value) =>
                        setRestoreForm({ ...restoreForm, backupId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a backup to restore" />
                      </SelectTrigger>
                      <SelectContent>
                        {backups
                          .filter((b) => b.status === "completed")
                          .map((backup) => (
                            <SelectItem key={backup.id} value={backup.id}>
                              <div className="flex items-center gap-2">
                                <span>{backup.name}</span>
                                <Badge className={getTypeColor(backup.type)}>
                                  {backup.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(backup.size)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Restore Mode</Label>
                    <Select
                      value={restoreForm.mode}
                      onValueChange={(value: any) =>
                        setRestoreForm({ ...restoreForm, mode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overwrite">
                          Overwrite Existing Data
                        </SelectItem>
                        <SelectItem value="merge">
                          Merge with Existing Data
                        </SelectItem>
                        <SelectItem value="skip_existing">
                          Skip Existing Objects
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Classes to Restore</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableClasses.map((className) => (
                        <div
                          key={className}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={className}
                            checked={restoreForm.classes.includes(className)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRestoreForm({
                                  ...restoreForm,
                                  classes: [...restoreForm.classes, className],
                                });
                              } else {
                                setRestoreForm({
                                  ...restoreForm,
                                  classes: restoreForm.classes.filter(
                                    (c) => c !== className,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={className}>{className}</Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to restore all classes from backup
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={restoreForm.validateBeforeRestore}
                        onCheckedChange={(checked) =>
                          setRestoreForm({
                            ...restoreForm,
                            validateBeforeRestore: checked as boolean,
                          })
                        }
                      />
                      <Label>Validate backup before restore</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={restoreForm.createMissingSchema}
                        onCheckedChange={(checked) =>
                          setRestoreForm({
                            ...restoreForm,
                            createMissingSchema: checked as boolean,
                          })
                        }
                      />
                      <Label>Create missing schema automatically</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRestoreBackup(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={startRestore}>Start Restore</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>
                    Create a backup of your Weaviate data and schema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupName">
                      Backup Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="backupName"
                      value={backupForm.name}
                      onChange={(e) =>
                        setBackupForm({ ...backupForm, name: e.target.value })
                      }
                      placeholder="e.g., Manual Backup - Pre Migration"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Backup Type</Label>
                      <Select
                        value={backupForm.type}
                        onValueChange={(value: any) =>
                          setBackupForm({ ...backupForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Backup</SelectItem>
                          <SelectItem value="incremental">
                            Incremental
                          </SelectItem>
                          <SelectItem value="schema_only">
                            Schema Only
                          </SelectItem>
                          <SelectItem value="data_only">Data Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Storage Location</Label>
                      <Input
                        value={backupForm.location}
                        onChange={(e) =>
                          setBackupForm({
                            ...backupForm,
                            location: e.target.value,
                          })
                        }
                        placeholder="s3://bucket/path/"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Classes to Backup</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableClasses.map((className) => (
                        <div
                          key={className}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={className}
                            checked={backupForm.classes.includes(className)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBackupForm({
                                  ...backupForm,
                                  classes: [...backupForm.classes, className],
                                });
                              } else {
                                setBackupForm({
                                  ...backupForm,
                                  classes: backupForm.classes.filter(
                                    (c) => c !== className,
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={className}>{className}</Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to backup all classes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={backupForm.description}
                      onChange={(e) =>
                        setBackupForm({
                          ...backupForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description for this backup..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={backupForm.compressed}
                      onCheckedChange={(checked) =>
                        setBackupForm({ ...backupForm, compressed: checked })
                      }
                    />
                    <Label>Enable compression</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateBackup(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createBackup}>Create Backup</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Backups
                  </p>
                  <p className="text-2xl font-bold">{backups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {backups.filter((b) => b.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Running
                  </p>
                  <p className="text-2xl font-bold">
                    {backups.filter((b) => b.status === "running").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Size
                  </p>
                  <p className="text-2xl font-bold">
                    {formatFileSize(
                      backups
                        .filter((b) => b.status === "completed")
                        .reduce((total, b) => total + b.size, 0),
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search backups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="incremental">Incremental</SelectItem>
              <SelectItem value="schema_only">Schema Only</SelectItem>
              <SelectItem value="data_only">Data Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Backups Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Backup History ({filteredBackups.length})
            </CardTitle>
            <CardDescription>
              All backup operations and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {backup.classes.length} classes •{" "}
                          {backup.compressed ? "Compressed" : "Uncompressed"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(backup.type)}>
                        {backup.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={getStatusColor(backup.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(backup.status, backup.progress)}
                            {backup.status}
                          </span>
                        </Badge>
                        {backup.status === "running" &&
                          backup.progress !== undefined && (
                            <div className="space-y-1">
                              <Progress
                                value={backup.progress}
                                className="h-1"
                              />
                              <div className="text-xs text-muted-foreground">
                                {backup.progress.toFixed(0)}%
                              </div>
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {backup.status === "completed"
                        ? formatFileSize(backup.size)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {backup.duration ? formatDuration(backup.duration) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(backup.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowBackupDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {backup.status === "completed" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setRestoreForm({
                                    ...restoreForm,
                                    backupId: backup.id,
                                  });
                                  setShowRestoreBackup(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Location
                              </DropdownMenuItem>
                            </>
                          )}
                          {backup.status === "running" && (
                            <DropdownMenuItem
                              onClick={() => cancelBackup(backup.id)}
                            >
                              <Square className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setBackupToDelete(backup.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBackups.length === 0 && (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No backups found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first backup to protect your data"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore Jobs */}
        {restoreJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Recent Restore Operations
              </CardTitle>
              <CardDescription>
                Track restore operations and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restoreJobs.map((restore) => {
                  const backup = backups.find((b) => b.id === restore.backupId);
                  return (
                    <div key={restore.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            Restoring: {backup?.name || "Unknown Backup"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Mode: {restore.restoreMode} • Classes:{" "}
                            {restore.selectedClasses.join(", ")}
                          </p>
                        </div>
                        <Badge className={getStatusColor(restore.status)}>
                          {getStatusIcon(restore.status)}
                          {restore.status}
                        </Badge>
                      </div>

                      {restore.status === "running" && (
                        <div className="space-y-2">
                          <Progress value={restore.progress} />
                          <div className="text-sm text-muted-foreground">
                            {restore.progress.toFixed(0)}% complete
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        Started: {new Date(restore.startedAt).toLocaleString()}
                        {restore.completedAt && (
                          <span>
                            {" "}
                            • Completed:{" "}
                            {new Date(restore.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup Detail Dialog */}
        <Dialog open={showBackupDetail} onOpenChange={setShowBackupDetail}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                {selectedBackup?.name}
              </DialogTitle>
              <DialogDescription>
                Backup created on{" "}
                {selectedBackup &&
                  new Date(selectedBackup.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedBackup && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="contents">Contents</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge className={getTypeColor(selectedBackup.type)}>
                        {selectedBackup.type}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedBackup.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(selectedBackup.status)}
                          {selectedBackup.status}
                        </span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Size</Label>
                      <p className="text-sm">
                        {selectedBackup.status === "completed"
                          ? formatFileSize(selectedBackup.size)
                          : "Processing..."}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm">
                        {selectedBackup.duration
                          ? formatDuration(selectedBackup.duration)
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                      {selectedBackup.location}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Checksum</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                      {selectedBackup.checksum || "Calculating..."}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="contents" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Included Classes
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedBackup.classes.map((className) => (
                        <Badge key={className} variant="outline">
                          {className}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Objects</Label>
                      <p className="text-2xl font-bold">
                        {selectedBackup.metadata.objectCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Schema Classes
                      </Label>
                      <p className="text-2xl font-bold">
                        {selectedBackup.metadata.schemaCount}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Backup ID</Label>
                      <p className="text-sm font-mono">{selectedBackup.id}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Compression</Label>
                      <p className="text-sm">
                        {selectedBackup.compressed ? "Enabled" : "Disabled"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm">
                        {new Date(selectedBackup.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {selectedBackup.completedAt && (
                      <div>
                        <Label className="text-sm font-medium">Completed</Label>
                        <p className="text-sm">
                          {new Date(
                            selectedBackup.completedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {selectedBackup.metadata.errors &&
                      selectedBackup.metadata.errors.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Errors</Label>
                          <div className="space-y-1 mt-1">
                            {selectedBackup.metadata.errors.map(
                              (error, index) => (
                                <p
                                  key={index}
                                  className="text-sm text-red-600 bg-red-50 p-2 rounded"
                                >
                                  {error}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {selectedBackup.schedule && (
                      <div>
                        <Label className="text-sm font-medium">Schedule</Label>
                        <div className="bg-muted p-3 rounded mt-1">
                          <p className="text-sm">
                            Frequency: {selectedBackup.schedule.frequency}
                            <br />
                            Retention: {selectedBackup.schedule.retention} days
                            <br />
                            Enabled:{" "}
                            {selectedBackup.schedule.enabled ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Backup</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this backup? This will
                permanently remove the backup file and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBackupToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteBackup}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Backup
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
