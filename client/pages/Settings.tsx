import { useState } from "react";
import {
  Save,
  Key,
  Shield,
  Database,
  Server,
  Clock,
  Mail,
  Bell,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "readonly";
  status: "active" | "disabled";
  lastLogin?: string;
}

interface BackupSettings {
  enabled: boolean;
  schedule: string;
  retention: number;
  location: string;
}

interface SecuritySettings {
  requireAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // General Settings State
  const [clusterName, setClusterName] = useState("Weaviate Cluster");
  const [clusterDescription, setClusterDescription] = useState(
    "Production Weaviate cluster for AI/ML applications",
  );
  const [enableMetrics, setEnableMetrics] = useState(true);
  const [enableTelemetry, setEnableTelemetry] = useState(false);
  const [logLevel, setLogLevel] = useState("info");
  const [timezone, setTimezone] = useState("UTC");

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "key-1",
      name: "Production App",
      key: "wv-abc123def456ghi789jkl012mno345pqr678stu901",
      permissions: ["read", "write"],
      createdAt: "2024-01-10T10:00:00Z",
      lastUsed: "2024-01-15T14:23:00Z",
      expiresAt: "2024-12-31T23:59:59Z",
    },
    {
      id: "key-2",
      name: "Development",
      key: "wv-def456ghi789jkl012mno345pqr678stu901vwx234",
      permissions: ["read"],
      createdAt: "2024-01-12T09:30:00Z",
      lastUsed: "2024-01-15T12:15:00Z",
    },
    {
      id: "key-3",
      name: "Analytics Dashboard",
      key: "wv-ghi789jkl012mno345pqr678stu901vwx234yzA567",
      permissions: ["read"],
      createdAt: "2024-01-14T16:45:00Z",
    },
  ]);

  // Users State
  const [users, setUsers] = useState<User[]>([
    {
      id: "user-1",
      username: "admin",
      email: "admin@company.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15T14:30:00Z",
    },
    {
      id: "user-2",
      username: "john.doe",
      email: "john.doe@company.com",
      role: "user",
      status: "active",
      lastLogin: "2024-01-15T10:15:00Z",
    },
    {
      id: "user-3",
      username: "jane.smith",
      email: "jane.smith@company.com",
      role: "readonly",
      status: "disabled",
      lastLogin: "2024-01-10T08:45:00Z",
    },
  ]);

  // Backup Settings State
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: true,
    schedule: "daily",
    retention: 30,
    location: "s3://weaviate-backups/",
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireAuth: true,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
  });

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("warning");
  const [maintenanceWindow, setMaintenanceWindow] = useState("02:00-04:00");

  const handleSaveSettings = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings Saved",
        description:
          "All configuration changes have been applied successfully.",
      });
    }, 1000);
  };

  const handleCreateApiKey = () => {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: "New API Key",
      key: `wv-${Math.random().toString(36).substr(2, 40)}`,
      permissions: ["read"],
      createdAt: new Date().toISOString(),
    };
    setApiKeys([...apiKeys, newKey]);
    toast({
      title: "API Key Created",
      description: "New API key has been generated successfully.",
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
    toast({
      title: "API Key Deleted",
      description: "API key has been removed successfully.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User account has been removed successfully.",
    });
  };

  const handleToggleUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "disabled" : "active",
            }
          : user,
      ),
    );
    toast({
      title: "User Status Updated",
      description: "User status has been changed successfully.",
    });
  };

  const exportSettings = () => {
    const settings = {
      cluster: { clusterName, clusterDescription },
      general: { enableMetrics, enableTelemetry, logLevel, timezone },
      backup: backupSettings,
      security: securitySettings,
      notifications: {
        emailNotifications,
        slackNotifications,
        alertThreshold,
        maintenanceWindow,
      },
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weaviate-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Settings Exported",
      description: "Configuration has been exported successfully.",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      case "readonly":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure cluster settings, security, and user management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportSettings} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving} size="sm">
              <Save
                className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`}
              />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Cluster Configuration
                  </CardTitle>
                  <CardDescription>
                    Basic cluster settings and metadata
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cluster-name">Cluster Name</Label>
                    <Input
                      id="cluster-name"
                      value={clusterName}
                      onChange={(e) => setClusterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cluster-description">Description</Label>
                    <Textarea
                      id="cluster-description"
                      value={clusterDescription}
                      onChange={(e) => setClusterDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Logging, metrics, and telemetry configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Metrics Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect performance metrics
                      </p>
                    </div>
                    <Switch
                      checked={enableMetrics}
                      onCheckedChange={setEnableMetrics}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Telemetry</Label>
                      <p className="text-sm text-muted-foreground">
                        Send anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={enableTelemetry}
                      onCheckedChange={setEnableTelemetry}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="log-level">Log Level</Label>
                    <Select value={logLevel} onValueChange={setLogLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and session settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable user authentication
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireAuth}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          requireAuth: checked,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                  <CardDescription>
                    Configure password requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            minLength: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireUppercase: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireNumbers: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Symbols</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireSymbols: checked,
                          },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Manage API keys for accessing the Weaviate cluster
                </p>
              </div>
              <Button onClick={handleCreateApiKey} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <div className="flex space-x-1">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={
                              showApiKey === apiKey.id
                                ? apiKey.key
                                : "•".repeat(40)
                            }
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowApiKey(
                                showApiKey === apiKey.id ? null : apiKey.id,
                              )
                            }
                          >
                            {showApiKey === apiKey.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            Created:{" "}
                            {new Date(apiKey.createdAt).toLocaleDateString()}
                          </span>
                          {apiKey.lastUsed && (
                            <span>
                              Last used:{" "}
                              {new Date(apiKey.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                          {apiKey.expiresAt && (
                            <span>
                              Expires:{" "}
                              {new Date(apiKey.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This
                              action cannot be undone and will immediately
                              revoke access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts and permissions
                </p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{user.username}</h4>
                          <Badge
                            variant="outline"
                            className={getRoleColor(user.role)}
                          >
                            {user.role}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getStatusColor(user.status)}
                          >
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {user.lastLogin && (
                            <span>
                              Last login:{" "}
                              {new Date(user.lastLogin).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUser(user.id)}
                        >
                          {user.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This
                                action cannot be undone and will immediately
                                revoke all access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup Configuration
                </CardTitle>
                <CardDescription>
                  Configure automated backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Automated Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create scheduled backups
                    </p>
                  </div>
                  <Switch
                    checked={backupSettings.enabled}
                    onCheckedChange={(checked) =>
                      setBackupSettings({
                        ...backupSettings,
                        enabled: checked,
                      })
                    }
                  />
                </div>
                {backupSettings.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="backup-schedule">Schedule</Label>
                      <Select
                        value={backupSettings.schedule}
                        onValueChange={(value) =>
                          setBackupSettings({
                            ...backupSettings,
                            schedule: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retention">Retention (days)</Label>
                      <Input
                        id="retention"
                        type="number"
                        value={backupSettings.retention}
                        onChange={(e) =>
                          setBackupSettings({
                            ...backupSettings,
                            retention: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-location">Storage Location</Label>
                      <Input
                        id="backup-location"
                        value={backupSettings.location}
                        onChange={(e) =>
                          setBackupSettings({
                            ...backupSettings,
                            location: e.target.value,
                          })
                        }
                        placeholder="s3://bucket-name/path/"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Alert Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive system alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send alerts to Slack channel
                      </p>
                    </div>
                    <Switch
                      checked={slackNotifications}
                      onCheckedChange={setSlackNotifications}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Alert Threshold</Label>
                    <Select
                      value={alertThreshold}
                      onValueChange={setAlertThreshold}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">All Alerts</SelectItem>
                        <SelectItem value="warning">Warning & Above</SelectItem>
                        <SelectItem value="critical">Critical Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Maintenance
                  </CardTitle>
                  <CardDescription>
                    Configure maintenance windows and schedules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-window">
                      Maintenance Window (UTC)
                    </Label>
                    <Input
                      id="maintenance-window"
                      value={maintenanceWindow}
                      onChange={(e) => setMaintenanceWindow(e.target.value)}
                      placeholder="02:00-04:00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: HH:MM-HH:MM (24-hour format)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
