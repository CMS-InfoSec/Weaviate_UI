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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Check,
  X,
  AlertCircle,
  Info,
  Zap,
  Brain,
  MessageSquare,
  Image,
  FileText,
  Music,
  Video,
  Globe,
  Database,
  MoreHorizontal,
  Play,
  Square,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import API_CONFIG from "@/lib/api";

interface Module {
  name: string;
  type: "vectorizer" | "generator" | "reader" | "qna" | "reranker";
  description: string;
  enabled: boolean;
  version?: string;
  status: "active" | "inactive" | "error";
  config?: Record<string, any>;
  dependencies?: string[];
}

export default function Modules() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch modules from Weaviate meta endpoint
  const fetchModules = async () => {
    try {
      const meta = await API_CONFIG.get("/meta");

      // Extract module information from meta response
      const moduleData = meta.modules || {};
      const extractedModules: Module[] = [];

      // Process each module from meta
      Object.entries(moduleData).forEach(
        ([moduleName, moduleInfo]: [string, any]) => {
          const module: Module = {
            name: moduleName,
            type: getModuleType(moduleName),
            description: getModuleDescription(moduleName),
            enabled: true, // Assume enabled if in meta
            version: moduleInfo.version || "Unknown",
            status: "active",
            config: moduleInfo,
          };
          extractedModules.push(module);
        },
      );

      // If no modules found, show common ones as disabled
      if (extractedModules.length === 0) {
        const commonModules = [
          "text2vec-openai",
          "text2vec-transformers",
          "text2vec-cohere",
          "generative-openai",
          "qna-openai",
          "reranker-cohere",
        ];

        commonModules.forEach((name) => {
          extractedModules.push({
            name,
            type: getModuleType(name),
            description: getModuleDescription(name),
            enabled: false,
            status: "inactive",
          });
        });
      }

      setModules(extractedModules);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch modules";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. Showing demo data.",
        );

        // Fallback demo modules
        setModules([
          {
            name: "text2vec-openai",
            type: "vectorizer",
            description: "OpenAI text vectorization module (Demo)",
            enabled: true,
            version: "1.0.0",
            status: "active",
            config: { model: "text-embedding-ada-002" },
          },
          {
            name: "text2vec-transformers",
            type: "vectorizer",
            description: "Transformers-based text vectorization (Demo)",
            enabled: false,
            status: "inactive",
          },
          {
            name: "generative-openai",
            type: "generator",
            description: "OpenAI text generation module (Demo)",
            enabled: true,
            version: "1.0.0",
            status: "active",
            config: { model: "gpt-3.5-turbo" },
          },
          {
            name: "qna-openai",
            type: "qna",
            description: "OpenAI Q&A module (Demo)",
            enabled: false,
            status: "inactive",
          },
        ]);

        toast({
          title: "Development Mode",
          description: "CORS prevents live connection. Showing demo modules.",
        });
      } else {
        setError(errorMessage);
        setModules([]);
        toast({
          title: "Modules Error",
          description: `Could not fetch modules: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Helper functions
  const getModuleType = (moduleName: string): Module["type"] => {
    if (moduleName.includes("text2vec") || moduleName.includes("img2vec"))
      return "vectorizer";
    if (moduleName.includes("generative")) return "generator";
    if (moduleName.includes("reader")) return "reader";
    if (moduleName.includes("qna")) return "qna";
    if (moduleName.includes("reranker")) return "reranker";
    return "vectorizer";
  };

  const getModuleDescription = (moduleName: string): string => {
    const descriptions: Record<string, string> = {
      "text2vec-openai": "OpenAI text vectorization using embeddings API",
      "text2vec-transformers": "Local transformers-based text vectorization",
      "text2vec-cohere": "Cohere text vectorization service",
      "text2vec-huggingface": "Hugging Face transformers integration",
      "generative-openai": "OpenAI text generation using GPT models",
      "generative-cohere": "Cohere text generation service",
      "qna-openai": "Question-answering using OpenAI models",
      "qna-transformers": "Local transformers Q&A models",
      "reranker-cohere": "Cohere reranking service",
      "img2vec-neural": "Neural network image vectorization",
    };
    return descriptions[moduleName] || `${moduleName} module`;
  };

  const getModuleIcon = (type: Module["type"]) => {
    switch (type) {
      case "vectorizer":
        return <Zap className="h-4 w-4" />;
      case "generator":
        return <Brain className="h-4 w-4" />;
      case "reader":
        return <FileText className="h-4 w-4" />;
      case "qna":
        return <MessageSquare className="h-4 w-4" />;
      case "reranker":
        return <Settings className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Module["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: Module["type"]) => {
    switch (type) {
      case "vectorizer":
        return "bg-blue-100 text-blue-800";
      case "generator":
        return "bg-purple-100 text-purple-800";
      case "reader":
        return "bg-green-100 text-green-800";
      case "qna":
        return "bg-orange-100 text-orange-800";
      case "reranker":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Refresh modules
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchModules();
    setRefreshing(false);

    toast({
      title: "Modules Refreshed",
      description: "Module data has been updated from Weaviate.",
    });
  };

  // Initial load
  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      await fetchModules();
      setLoading(false);
    };

    loadModules();
  }, []);

  // Filter modules by tab
  const filteredModules = modules.filter((module) => {
    if (activeTab === "all") return true;
    if (activeTab === "enabled") return module.enabled;
    if (activeTab === "disabled") return !module.enabled;
    return module.type === activeTab;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Loading Modules</h2>
                <p className="text-muted-foreground">
                  Fetching module data from Weaviate instance...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Module Configuration
            </h1>
            <p className="text-muted-foreground">
              Manage Weaviate modules and their configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-700 font-medium">
                  Development Mode
                </span>
              </div>
              <p className="text-yellow-600 mt-2 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Module Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Modules
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
              <p className="text-xs text-muted-foreground">Available modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Modules
              </CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {modules.filter((m) => m.enabled).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vectorizers</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {modules.filter((m) => m.type === "vectorizer").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Text/image vectorizers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generators</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {modules.filter((m) => m.type === "generator").length}
              </div>
              <p className="text-xs text-muted-foreground">Text generators</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
            <TabsTrigger value="vectorizer">Vectorizers</TabsTrigger>
            <TabsTrigger value="generator">Generators</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Modules ({filteredModules.length})
                </CardTitle>
                <CardDescription>
                  Configure and manage Weaviate modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredModules.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Modules Found
                    </h3>
                    <p className="text-muted-foreground">
                      No modules match the current filter.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModules.map((module) => (
                        <TableRow key={module.name}>
                          <TableCell className="flex items-center space-x-2">
                            {getModuleIcon(module.type)}
                            <span className="font-medium">{module.name}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getTypeColor(module.type)}
                            >
                              {module.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {module.description}
                          </TableCell>
                          <TableCell>{module.version || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(module.status)}
                            >
                              {module.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setSelectedModule(module)}
                                >
                                  <Info className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleModule(module.name)
                                  }
                                >
                                  {module.enabled ? (
                                    <>
                                      <Square className="h-4 w-4 mr-2" />
                                      Disable
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Enable
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Configure
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Module Details Dialog */}
        {selectedModule && (
          <Dialog
            open={!!selectedModule}
            onOpenChange={() => setSelectedModule(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getModuleIcon(selectedModule.type)}
                  <span>{selectedModule.name}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedModule.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Badge
                      variant="outline"
                      className={getTypeColor(selectedModule.type)}
                    >
                      {selectedModule.type}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge
                      variant="outline"
                      className={getStatusColor(selectedModule.status)}
                    >
                      {selectedModule.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedModule.version || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label>Enabled</Label>
                    <Switch
                      checked={selectedModule.enabled}
                      onCheckedChange={() =>
                        handleToggleModule(selectedModule.name)
                      }
                    />
                  </div>
                </div>

                {selectedModule.config && (
                  <div>
                    <Label>Configuration</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(selectedModule.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
