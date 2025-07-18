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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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
  Database,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  ExternalLink,
  Play,
  Square,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import API_CONFIG from "@/lib/api";

interface Module {
  name: string;
  type: "vectorizer" | "generator" | "reader" | "qna" | "reranker" | "other";
  description: string;
  enabled: boolean;
  version?: string;
  status: "active" | "inactive" | "error" | "unknown";
  config?: Record<string, any>;
  documentationHref?: string;
  displayName?: string;
}

interface WeaviateMetaResponse {
  hostname: string;
  version: string;
  modules: Record<
    string,
    {
      name?: string;
      version?: string;
      documentationHref?: string;
    }
  >;
}

interface WeaviateModulesResponse {
  modules: Record<string, any>;
}

export default function Modules() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [weaviateVersion, setWeaviateVersion] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");

  // Fetch modules from /v1/meta endpoint (primary) and optionally /v1/modules
  const fetchModules = async () => {
    try {
      setError(null);

      // Fetch from /v1/meta endpoint first
      const metaResponse: WeaviateMetaResponse = await API_CONFIG.get("/meta");
      setWeaviateVersion(metaResponse.version || "Unknown");
      setHostname(metaResponse.hostname || "Unknown");

      // Try to fetch from /v1/modules endpoint for additional info (optional)
      let modulesResponse: WeaviateModulesResponse | null = null;
      try {
        modulesResponse = await API_CONFIG.get("/modules");
      } catch (modulesError) {
        // Silently handle 404 or other errors from /v1/modules endpoint
        // This endpoint is not available on all Weaviate versions
        console.info(
          "/v1/modules endpoint not available, using /v1/meta only:",
          modulesError instanceof Error ? modulesError.message : modulesError,
        );
      }

      // Process modules from meta response
      const extractedModules: Module[] = [];
      const metaModules = metaResponse.modules || {};

      Object.entries(metaModules).forEach(([moduleName, moduleInfo]) => {
        const module: Module = {
          name: moduleName,
          type: getModuleType(moduleName),
          description: getModuleDescription(moduleName),
          enabled: true, // If it's in meta, it's enabled
          version: moduleInfo.version,
          status: "active",
          config: moduleInfo,
          documentationHref: moduleInfo.documentationHref,
          displayName: moduleInfo.name || moduleName,
        };
        extractedModules.push(module);
      });

      // Add commonly known modules that might not be enabled
      const commonModules = [
        "text2vec-openai",
        "text2vec-transformers",
        "text2vec-cohere",
        "text2vec-huggingface",
        "text2vec-palm",
        "generative-openai",
        "generative-cohere",
        "generative-palm",
        "qna-openai",
        "qna-transformers",
        "reranker-cohere",
        "img2vec-neural",
        "multi2vec-clip",
        "backup-filesystem",
        "backup-s3",
        "backup-gcs",
      ];

      // Add missing common modules as inactive
      commonModules.forEach((moduleName) => {
        if (!extractedModules.find((m) => m.name === moduleName)) {
          extractedModules.push({
            name: moduleName,
            type: getModuleType(moduleName),
            description: getModuleDescription(moduleName),
            enabled: false,
            status: "inactive",
          });
        }
      });

      // Sort modules - enabled first, then by name
      extractedModules.sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return b.enabled ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

      setModules(extractedModules);
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

        // Fallback demo modules with realistic data
        setModules([
          {
            name: "text2vec-openai",
            type: "vectorizer",
            description: "OpenAI text vectorization using embeddings API",
            enabled: true,
            version: "1.0.0",
            status: "active",
            config: { model: "text-embedding-ada-002" },
            documentationHref:
              "https://platform.openai.com/docs/guides/embeddings",
            displayName: "OpenAI Vectorizer",
          },
          {
            name: "generative-openai",
            type: "generator",
            description: "OpenAI text generation using GPT models",
            enabled: true,
            version: "1.0.0",
            status: "active",
            config: { model: "gpt-3.5-turbo" },
            documentationHref:
              "https://platform.openai.com/docs/guides/generation",
            displayName: "Generative Search - OpenAI",
          },
          {
            name: "text2vec-transformers",
            type: "vectorizer",
            description: "Local transformers-based text vectorization",
            enabled: false,
            status: "inactive",
          },
          {
            name: "qna-openai",
            type: "qna",
            description: "Question-answering using OpenAI models",
            enabled: false,
            status: "inactive",
          },
          {
            name: "reranker-cohere",
            type: "reranker",
            description: "Cohere reranking service for improved search results",
            enabled: false,
            status: "inactive",
          },
        ]);

        setWeaviateVersion("1.26.1 (Demo)");
        setHostname("weaviate.cmsinfosec.com (Demo)");

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
    if (
      moduleName.includes("text2vec") ||
      moduleName.includes("img2vec") ||
      moduleName.includes("multi2vec")
    )
      return "vectorizer";
    if (moduleName.includes("generative")) return "generator";
    if (moduleName.includes("reader")) return "reader";
    if (moduleName.includes("qna")) return "qna";
    if (moduleName.includes("reranker")) return "reranker";
    return "other";
  };

  const getModuleDescription = (moduleName: string): string => {
    const descriptions: Record<string, string> = {
      "text2vec-openai": "OpenAI text vectorization using embeddings API",
      "text2vec-transformers": "Local transformers-based text vectorization",
      "text2vec-cohere": "Cohere text vectorization service",
      "text2vec-huggingface": "Hugging Face transformers integration",
      "text2vec-palm": "Google PaLM text vectorization service",
      "generative-openai": "OpenAI text generation using GPT models",
      "generative-cohere": "Cohere text generation service",
      "generative-palm": "Google PaLM text generation service",
      "qna-openai": "Question-answering using OpenAI models",
      "qna-transformers": "Local transformers Q&A models",
      "reranker-cohere": "Cohere reranking service for improved search results",
      "img2vec-neural": "Neural network image vectorization",
      "multi2vec-clip": "CLIP-based multimodal vectorization",
      "backup-filesystem": "Local filesystem backup storage",
      "backup-s3": "Amazon S3 backup storage",
      "backup-gcs": "Google Cloud Storage backup",
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
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: Module["status"]) => {
    switch (status) {
      case "active":
        return <Play className="h-3 w-3" />;
      case "inactive":
        return <Square className="h-3 w-3" />;
      case "error":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: Module["type"]) => {
    switch (type) {
      case "vectorizer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "generator":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "reader":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "qna":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "reranker":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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
                  Fetching live module data from Weaviate instance...
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
              Modules Management
            </h1>
            <p className="text-muted-foreground">
              View and manage Weaviate modules and their configurations
            </p>
            {hostname && (
              <p className="text-sm text-muted-foreground mt-1">
                Connected to: {hostname} • Version: {weaviateVersion}
              </p>
            )}
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
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                  Development Mode
                </span>
              </div>
              <p className="text-yellow-600 dark:text-yellow-400 mt-2 text-sm">
                {error}
              </p>
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
            <TabsTrigger value="enabled">
              Enabled ({modules.filter((m) => m.enabled).length})
            </TabsTrigger>
            <TabsTrigger value="disabled">
              Disabled ({modules.filter((m) => !m.enabled).length})
            </TabsTrigger>
            <TabsTrigger value="vectorizer">Vectorizers</TabsTrigger>
            <TabsTrigger value="generator">Generators</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Modules ({filteredModules.length})
                </CardTitle>
                <CardDescription>
                  Module status is determined by live data from your Weaviate
                  instance
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
                            <div>
                              <div className="font-medium">
                                {module.displayName || module.name}
                              </div>
                              {module.displayName &&
                                module.displayName !== module.name && (
                                  <div className="text-xs text-muted-foreground">
                                    {module.name}
                                  </div>
                                )}
                            </div>
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
                          <TableCell>{module.version || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(module.status)}
                            >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(module.status)}
                                {module.status}
                              </span>
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
                                {module.documentationHref && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={module.documentationHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Documentation
                                      </a>
                                    </DropdownMenuItem>
                                  </>
                                )}
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

            {/* Configuration Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Module Configuration
                </CardTitle>
                <CardDescription>
                  How to configure modules in your Weaviate deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Environment Variables</h4>
                  <p className="text-sm text-muted-foreground">
                    Modules are configured at deployment time using environment
                    variables:
                  </p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    <div>ENABLE_MODULES=text2vec-openai,generative-openai</div>
                    <div>DEFAULT_VECTORIZER_MODULE=text2vec-openai</div>
                    <div>OPENAI_APIKEY=your-api-key</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Runtime Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Some module settings can be updated at runtime when enabled:
                  </p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    <div>RUNTIME_OVERRIDES_ENABLED=true</div>
                    <div>RUNTIME_OVERRIDES_PATH=/config/overrides.json</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Docker/Kubernetes Deployment</h4>
                  <p className="text-sm text-muted-foreground">
                    For containerized deployments, add environment variables to
                    your deployment configuration.
                  </p>
                </div>
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
                  <span>
                    {selectedModule.displayName || selectedModule.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedModule.status)}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedModule.status)}
                      {selectedModule.status}
                    </span>
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedModule.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Module Name</Label>
                    <p className="text-sm font-mono">{selectedModule.name}</p>
                  </div>
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
                    <Label>Version</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedModule.version || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label>Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedModule.enabled ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {selectedModule.documentationHref && (
                  <div>
                    <Label>Documentation</Label>
                    <a
                      href={selectedModule.documentationHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View official documentation
                    </a>
                  </div>
                )}

                {selectedModule.config &&
                  Object.keys(selectedModule.config).length > 0 && (
                    <div>
                      <Label>Live Configuration</Label>
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
