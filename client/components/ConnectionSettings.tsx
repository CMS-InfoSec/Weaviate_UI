import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  Database,
  ExternalLink,
  Copy,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ConnectionProfile {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  description?: string;
  isDefault?: boolean;
  lastTested?: Date;
  status?: "connected" | "error" | "untested";
}

interface ConnectionSettingsProps {
  onConnectionChange?: (profile: ConnectionProfile) => void;
}

export default function ConnectionSettings({
  onConnectionChange,
}: ConnectionSettingsProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] =
    useState<ConnectionProfile | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Default profiles
  const defaultProfiles: ConnectionProfile[] = [
    {
      id: "current",
      name: "CMS InfoSec Instance",
      endpoint: "https://weaviate.cmsinfosec.com/v1",
      description: "Production Weaviate instance",
      isDefault: true,
      status: "untested",
    },
    {
      id: "local",
      name: "Local Development",
      endpoint: "http://localhost:8080/v1",
      description: "Local Docker instance",
      status: "untested",
    },
    {
      id: "cloud",
      name: "Weaviate Cloud",
      endpoint: "https://your-cluster.weaviate.network/v1",
      description: "Weaviate Cloud Service instance",
      status: "untested",
    },
  ];

  // Load profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem("weaviate-connections");
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed);
        // Find default profile
        const defaultProfile = parsed.find(
          (p: ConnectionProfile) => p.isDefault,
        );
        if (defaultProfile) {
          setSelectedProfile(defaultProfile.id);
        }
      } catch (error) {
        console.error("Failed to load saved connections:", error);
        setProfiles(defaultProfiles);
      }
    } else {
      setProfiles(defaultProfiles);
      setSelectedProfile("current");
    }
  }, []);

  // Save profiles to localStorage
  const saveProfiles = (newProfiles: ConnectionProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem("weaviate-connections", JSON.stringify(newProfiles));
  };

  // Test connection to a Weaviate instance
  const testConnection = async (profile: ConnectionProfile) => {
    setTestingConnection(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (profile.apiKey) {
        headers["Authorization"] = `Bearer ${profile.apiKey}`;
      }

      const response = await fetch(`${profile.endpoint}/meta`, {
        method: "GET",
        headers,
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Update profile status
      const updatedProfiles = profiles.map((p) =>
        p.id === profile.id
          ? {
              ...p,
              status: "connected" as const,
              lastTested: new Date(),
            }
          : p,
      );
      saveProfiles(updatedProfiles);

      toast({
        title: "Connection Successful",
        description: `Connected to Weaviate ${data.version || "instance"}`,
      });

      return true;
    } catch (error) {
      // Update profile status
      const updatedProfiles = profiles.map((p) =>
        p.id === profile.id
          ? {
              ...p,
              status: "error" as const,
              lastTested: new Date(),
            }
          : p,
      );
      saveProfiles(updatedProfiles);

      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  // Set as default connection
  const setAsDefault = (profileId: string) => {
    const updatedProfiles = profiles.map((p) => ({
      ...p,
      isDefault: p.id === profileId,
    }));
    saveProfiles(updatedProfiles);
    setSelectedProfile(profileId);

    const profile = profiles.find((p) => p.id === profileId);
    if (profile && onConnectionChange) {
      onConnectionChange(profile);
    }

    toast({
      title: "Default Connection Updated",
      description: "Page will refresh to apply new connection",
    });

    // Refresh the page to apply new connection
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Start editing profile
  const startEdit = (profile?: ConnectionProfile) => {
    setEditingProfile(
      profile || {
        id: "",
        name: "",
        endpoint: "",
        apiKey: "",
        description: "",
        status: "untested",
      },
    );
    setIsEditing(true);
  };

  // Save edited profile
  const saveProfile = () => {
    if (!editingProfile) return;

    const isNew = !editingProfile.id;
    const id = editingProfile.id || `profile-${Date.now()}`;

    const updatedProfile = {
      ...editingProfile,
      id,
    };

    const updatedProfiles = isNew
      ? [...profiles, updatedProfile]
      : profiles.map((p) => (p.id === id ? updatedProfile : p));

    saveProfiles(updatedProfiles);
    setIsEditing(false);
    setEditingProfile(null);

    toast({
      title: isNew ? "Profile Created" : "Profile Updated",
      description: `Connection profile "${updatedProfile.name}" has been saved`,
    });
  };

  // Delete profile
  const deleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    saveProfiles(updatedProfiles);

    toast({
      title: "Profile Deleted",
      description: "Connection profile has been removed",
    });
  };

  // Copy connection string
  const copyConnectionString = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    toast({
      title: "Copied to clipboard",
      description: "Connection endpoint copied",
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="text-green-700 border-green-300">
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="text-red-700 border-red-300">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-700 border-gray-300">
            Untested
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Weaviate Connection Settings
          </DialogTitle>
          <DialogDescription>
            Manage connections to different Weaviate instances. Changes require
            a page refresh to take effect.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Connection */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Current Connection</h3>
            {profiles.find((p) => p.isDefault) ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {profiles.find((p) => p.isDefault)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profiles.find((p) => p.isDefault)?.endpoint}
                  </p>
                </div>
                {getStatusBadge(profiles.find((p) => p.isDefault)?.status)}
              </div>
            ) : (
              <p className="text-muted-foreground">No default connection set</p>
            )}
          </div>

          {/* Connection Profiles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Connection Profiles</h3>
              <Button onClick={() => startEdit()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </div>

            <div className="grid gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(profile.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{profile.name}</h4>
                          {profile.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profile.endpoint}
                        </p>
                        {profile.description && (
                          <p className="text-xs text-muted-foreground">
                            {profile.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(profile.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnection(profile)}
                      disabled={testingConnection}
                    >
                      {testingConnection ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyConnectionString(profile.endpoint)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    {!profile.isDefault && (
                      <Button
                        size="sm"
                        onClick={() => setAsDefault(profile.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(profile)}
                    >
                      Edit
                    </Button>
                    {profiles.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteProfile(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && editingProfile && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">
                {editingProfile.id ? "Edit Profile" : "Add New Profile"}
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Profile Name</Label>
                  <Input
                    id="name"
                    value={editingProfile.name}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        name: e.target.value,
                      })
                    }
                    placeholder="My Weaviate Instance"
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={editingProfile.endpoint}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        endpoint: e.target.value,
                      })
                    }
                    placeholder="https://your-weaviate.com/v1"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key (Optional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={editingProfile.apiKey || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        apiKey: e.target.value,
                      })
                    }
                    placeholder="Your API key if authentication is enabled"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={editingProfile.description || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description of this connection"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveProfile}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProfile(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
