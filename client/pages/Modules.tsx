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
import { useToast } from "@/hooks/use-toast";
import {
  Puzzle,
  Settings,
  Play,
  Square,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Zap,
  Brain,
  Globe,
  Database,
  Image,
  Mic,
  FileText,
} from "lucide-react";
import { useState } from "react";

interface ModuleConfig {
  [key: string]: any;
}

interface WeaviateModule {
  name: string;
  version: string;
  enabled: boolean;
  status: "running" | "stopped" | "error" | "installing";
  type:
    | "vectorizer"
    | "reader"
    | "generator"
    | "transformer"
    | "qna"
    | "reranker";
  description: string;
  documentation: string;
  config: ModuleConfig;
  dependencies?: string[];
  lastUpdated: string;
  healthCheck?: {
    status: "healthy" | "warning" | "error";
    message: string;
    lastCheck: string;
  };
}

export default function Modules() {
  const { toast } = useToast();

  const [modules, setModules] = useState<WeaviateModule[]>([
    {
      name: "text2vec-openai",
      version: "1.22.1",
      enabled: true,
      status: "running",
      type: "vectorizer",
      description: "OpenAI text vectorization using text-embedding-ada-002",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai",
      config: {
        apiKey: "sk-***",
        model: "text-embedding-ada-002",
        baseURL: "https://api.openai.com/v1/",
        timeout: 30,
        skipValidation: false,
      },
      lastUpdated: "2024-01-15T10:30:00Z",
      healthCheck: {
        status: "healthy",
        message: "All systems operational",
        lastCheck: "2024-01-20T14:22:00Z",
      },
    },
    {
      name: "text2vec-cohere",
      version: "1.22.1",
      enabled: true,
      status: "running",
      type: "vectorizer",
      description: "Cohere text vectorization using embed-english-v3.0",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere",
      config: {
        apiKey: "co-***",
        model: "embed-english-v3.0",
        baseURL: "https://api.cohere.ai/v1/",
        inputType: "search_document",
        truncate: "END",
      },
      lastUpdated: "2024-01-12T16:45:00Z",
      healthCheck: {
        status: "healthy",
        message: "All systems operational",
        lastCheck: "2024-01-20T14:20:00Z",
      },
    },
    {
      name: "text2vec-huggingface",
      version: "1.22.1",
      enabled: false,
      status: "stopped",
      type: "vectorizer",
      description: "Hugging Face text vectorization using transformers",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface",
      config: {
        model: "sentence-transformers/all-MiniLM-L6-v2",
        waitForModel: true,
        useGPU: false,
        useCache: true,
      },
      lastUpdated: "2024-01-10T09:15:00Z",
    },
    {
      name: "generative-openai",
      version: "1.22.1",
      enabled: true,
      status: "running",
      type: "generator",
      description: "OpenAI text generation using GPT models",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai",
      config: {
        apiKey: "sk-***",
        model: "gpt-3.5-turbo",
        baseURL: "https://api.openai.com/v1/",
        maxTokens: 512,
        temperature: 0.7,
      },
      lastUpdated: "2024-01-18T11:30:00Z",
      healthCheck: {
        status: "healthy",
        message: "All systems operational",
        lastCheck: "2024-01-20T14:18:00Z",
      },
    },
    {
      name: "qna-openai",
      version: "1.22.1",
      enabled: true,
      status: "running",
      type: "qna",
      description: "OpenAI question answering using GPT models",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/reader-generator-modules/qna-openai",
      config: {
        apiKey: "sk-***",
        model: "gpt-3.5-turbo",
        baseURL: "https://api.openai.com/v1/",
        maxTokens: 256,
      },
      lastUpdated: "2024-01-16T14:20:00Z",
      healthCheck: {
        status: "warning",
        message: "Rate limit approaching",
        lastCheck: "2024-01-20T14:15:00Z",
      },
    },
    {
      name: "reranker-cohere",
      version: "1.22.1",
      enabled: false,
      status: "stopped",
      type: "reranker",
      description: "Cohere reranking for improved search results",
      documentation:
        "https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/reranker-cohere",
      config: {
        apiKey: "",
        model: "rerank-english-v2.0",
        returnDocuments: true,
      },
      lastUpdated: "2024-01-08T12:00:00Z",
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<WeaviateModule | null>(
    null,
  );
  const [editingModule, setEditingModule] = useState<WeaviateModule | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [showInstallModule, setShowInstallModule] = useState(false);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
  const [moduleToUninstall, setModuleToUninstall] = useState<string | null>(
    null,
  );

  // Configuration form state
  const [configForm, setConfigForm] = useState<ModuleConfig>({});

  // Filter modules
  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && module.enabled) ||
      (statusFilter === "disabled" && !module.enabled) ||
      module.status === statusFilter;

    const matchesType = typeFilter === "all" || module.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle module enable/disable
  const toggleModule = async (moduleName: string) => {
    const module = modules.find((m) => m.name === moduleName);
    if (!module) return;

    const newEnabled = !module.enabled;
    const newStatus = newEnabled ? "running" : "stopped";

    setModules(
      modules.map((m) =>
        m.name === moduleName
          ? { ...m, enabled: newEnabled, status: newStatus }
          : m,
      ),
    );

    toast({
      title: newEnabled ? "Module Enabled" : "Module Disabled",
      description: `${moduleName} has been ${newEnabled ? "enabled" : "disabled"}`,
    });
  };

  // Save module configuration
  const saveModuleConfig = () => {
    if (!editingModule) return;

    setModules(
      modules.map((m) =>
        m.name === editingModule.name
          ? {
              ...m,
              config: { ...configForm },
              lastUpdated: new Date().toISOString(),
            }
          : m,
      ),
    );

    setEditingModule(null);
    setConfigForm({});
    setShowConfigEdit(false);

    toast({
      title: "Configuration Saved",
      description: `${editingModule.name} configuration has been updated`,
    });
  };

  // Start module configuration edit
  const startConfigEdit = (module: WeaviateModule) => {
    setEditingModule(module);
    setConfigForm({ ...module.config });
    setShowConfigEdit(true);
  };

  // Run health check
  const runHealthCheck = async (moduleName: string) => {
    const module = modules.find((m) => m.name === moduleName);
    if (!module || !module.enabled) return;

    // Simulate health check
    const healthStatuses = ["healthy", "warning", "error"] as const;
    const randomStatus =
      healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
    const messages = {
      healthy: "All systems operational",
      warning: "Minor performance issues detected",
      error: "Service unavailable",
    };

    setModules(
      modules.map((m) =>
        m.name === moduleName
          ? {
              ...m,
              healthCheck: {
                status: randomStatus,
                message: messages[randomStatus],
                lastCheck: new Date().toISOString(),
              },
            }
          : m,
      ),
    );

    toast({
      title: "Health Check Complete",
      description: `${moduleName}: ${messages[randomStatus]}`,
      variant: randomStatus === "error" ? "destructive" : "default",
    });
  };

  // Uninstall module
  const uninstallModule = () => {
    if (!moduleToUninstall) return;

    setModules(modules.filter((m) => m.name !== moduleToUninstall));
    setModuleToUninstall(null);
    setShowUninstallConfirm(false);

    toast({
      title: "Module Uninstalled",
      description: `${moduleToUninstall} has been removed`,
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "stopped":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "installing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "stopped":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "installing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vectorizer":
        return <Zap className="h-4 w-4" />;
      case "generator":
        return <Brain className="h-4 w-4" />;
      case "reader":
        return <FileText className="h-4 w-4" />;
      case "qna":
        return <Mic className="h-4 w-4" />;
      case "reranker":
        return <Database className="h-4 w-4" />;
      case "transformer":
        return <Globe className="h-4 w-4" />;
      default:
        return <Puzzle className="h-4 w-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "vectorizer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "generator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reader":
        return "bg-green-100 text-green-800 border-green-200";
      case "qna":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "reranker":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "transformer":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get health check color
  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Module Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure Weaviate modules and vectorizers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
            <Dialog
              open={showInstallModule}
              onOpenChange={setShowInstallModule}
            >
              <DialogTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Install Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Install New Module</DialogTitle>
                  <DialogDescription>
                    Install a new Weaviate module from the registry
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Module Name</Label>
                    <Input placeholder="e.g., text2vec-transformers" />
                  </div>
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input placeholder="latest" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowInstallModule(false)}
                    >
                      Cancel
                    </Button>
                    <Button>Install</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Module Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Modules
                  </p>
                  <p className="text-2xl font-bold">{modules.length}</p>
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
                    Enabled
                  </p>
                  <p className="text-2xl font-bold">
                    {modules.filter((m) => m.enabled).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Running
                  </p>
                  <p className="text-2xl font-bold">
                    {modules.filter((m) => m.status === "running").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vectorizers
                  </p>
                  <p className="text-2xl font-bold">
                    {modules.filter((m) => m.type === "vectorizer").length}
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
              placeholder="Search modules..."
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
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vectorizer">Vectorizer</SelectItem>
              <SelectItem value="generator">Generator</SelectItem>
              <SelectItem value="reader">Reader</SelectItem>
              <SelectItem value="qna">Q&A</SelectItem>
              <SelectItem value="reranker">Reranker</SelectItem>
              <SelectItem value="transformer">Transformer</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Modules Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Installed Modules ({filteredModules.length})
            </CardTitle>
            <CardDescription>
              All installed Weaviate modules and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module) => (
                  <TableRow key={module.name}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(module.type)}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(module.type)}
                          {module.type}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={module.enabled}
                          onCheckedChange={() => toggleModule(module.name)}
                        />
                        <Badge className={getStatusColor(module.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(module.status)}
                            {module.status}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {module.healthCheck ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            className={`h-4 w-4 ${getHealthColor(module.healthCheck.status)}`}
                          />
                          <span className="text-sm">
                            {module.healthCheck.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{module.version}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(module.lastUpdated).toLocaleDateString()}
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
                              setSelectedModule(module);
                              setShowModuleDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => startConfigEdit(module)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          {module.enabled && (
                            <DropdownMenuItem
                              onClick={() => runHealthCheck(module.name)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Health Check
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setModuleToUninstall(module.name);
                              setShowUninstallConfirm(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Uninstall
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredModules.length === 0 && (
              <div className="text-center py-8">
                <Puzzle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Install your first module to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Detail Dialog */}
        <Dialog open={showModuleDetail} onOpenChange={setShowModuleDetail}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                {selectedModule?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedModule?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedModule && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge className={getTypeColor(selectedModule.type)}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(selectedModule.type)}
                          {selectedModule.type}
                        </span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm">{selectedModule.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedModule.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(selectedModule.status)}
                          {selectedModule.status}
                        </span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Enabled</Label>
                      <p className="text-sm">
                        {selectedModule.enabled ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm mt-1">{selectedModule.description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Documentation</Label>
                    <a
                      href={selectedModule.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block mt-1"
                    >
                      {selectedModule.documentation}
                    </a>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(selectedModule.config).map(
                      ([key, value]) => (
                        <div key={key} className="border rounded-lg p-3">
                          <Label className="font-medium">{key}</Label>
                          <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">
                            {typeof value === "string" &&
                            key.toLowerCase().includes("key")
                              ? "***"
                              : JSON.stringify(value, null, 2)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  {selectedModule.healthCheck ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle
                          className={`h-6 w-6 ${getHealthColor(selectedModule.healthCheck.status)}`}
                        />
                        <div>
                          <h3 className="font-medium capitalize">
                            {selectedModule.healthCheck.status}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedModule.healthCheck.message}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Last Check
                        </Label>
                        <p className="text-sm">
                          {new Date(
                            selectedModule.healthCheck.lastCheck,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => runHealthCheck(selectedModule.name)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Health Check
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Health Data
                      </h3>
                      <p className="text-muted-foreground">
                        Health monitoring is not available for this module
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Configuration Edit Dialog */}
        <Dialog open={showConfigEdit} onOpenChange={setShowConfigEdit}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure {editingModule?.name}</DialogTitle>
              <DialogDescription>
                Update the module configuration settings
              </DialogDescription>
            </DialogHeader>

            {editingModule && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(editingModule.config).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{key}</Label>
                    {typeof value === "boolean" ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={configForm[key] as boolean}
                          onCheckedChange={(checked) =>
                            setConfigForm({ ...configForm, [key]: checked })
                          }
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key}
                        </Label>
                      </div>
                    ) : typeof value === "number" ? (
                      <Input
                        id={key}
                        type="number"
                        value={configForm[key] as number}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    ) : (
                      <Input
                        id={key}
                        type={
                          key.toLowerCase().includes("key")
                            ? "password"
                            : "text"
                        }
                        value={configForm[key] as string}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={
                          key.toLowerCase().includes("key")
                            ? "Enter API key..."
                            : ""
                        }
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfigEdit(false);
                      setEditingModule(null);
                      setConfigForm({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveModuleConfig}>Save Configuration</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Uninstall Confirmation */}
        <AlertDialog
          open={showUninstallConfirm}
          onOpenChange={setShowUninstallConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Uninstall Module</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to uninstall "{moduleToUninstall}"? This
                will remove the module and all its configurations. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setModuleToUninstall(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={uninstallModule}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Uninstall
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
