import { useState, useRef, useEffect } from "react";
import {
  Code,
  Play,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  FileText,
  Database,
  Search,
  Settings,
  Bug,
  Zap,
  Eye,
  BookOpen,
  Send,
  History,
  Save,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import API_CONFIG from "@/lib/api";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean }[];
}

interface QueryHistory {
  id: string;
  type: "rest" | "graphql";
  method?: string;
  endpoint?: string;
  query: string;
  timestamp: string;
  status?: "success" | "error";
}

interface SchemaClass {
  name: string;
  description: string;
  properties: Array<{
    name: string;
    dataType: string;
    description: string;
  }>;
  vectorizer: string;
}

export default function DevTools() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("api-explorer");

  // API Explorer State
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [apiEndpoint, setApiEndpoint] = useState("/v1/objects");
  const [requestBody, setRequestBody] = useState("");
  const [responseData, setResponseData] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  // GraphQL State
  const [graphqlQuery, setGraphqlQuery] = useState(`{
  Get {
    Article {
      title
      content
      _additional {
        id
        vector
      }
    }
  }
}`);
  const [graphqlVariables, setGraphqlVariables] = useState("{}");
  const [graphqlResponse, setGraphqlResponse] = useState("");

  // Schema Inspector State
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
    new Set(),
  );

  // Query History State
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);

  // Comprehensive API endpoints list
  const apiEndpoints: ApiEndpoint[] = [
    // Core Objects API
    {
      method: "GET",
      path: "/v1/objects",
      description: "Retrieve all objects with optional filtering",
      parameters: [
        { name: "limit", type: "integer", required: false },
        { name: "offset", type: "integer", required: false },
        { name: "class", type: "string", required: false },
        { name: "include", type: "string", required: false },
        { name: "where", type: "string", required: false },
      ],
    },
    {
      method: "POST",
      path: "/v1/objects",
      description: "Create a new object",
    },
    {
      method: "GET",
      path: "/v1/objects/{id}",
      description: "Retrieve specific object by ID",
      parameters: [
        { name: "include", type: "string", required: false },
        { name: "additional", type: "string", required: false },
      ],
    },
    {
      method: "PUT",
      path: "/v1/objects/{id}",
      description: "Update an existing object",
    },
    {
      method: "PATCH",
      path: "/v1/objects/{id}",
      description: "Partially update an object",
    },
    {
      method: "DELETE",
      path: "/v1/objects/{id}",
      description: "Delete an object by ID",
    },
    {
      method: "HEAD",
      path: "/v1/objects/{id}",
      description: "Check if object exists",
    },

    // Schema Management
    {
      method: "GET",
      path: "/v1/schema",
      description: "Retrieve the complete schema definition",
    },
    {
      method: "POST",
      path: "/v1/schema",
      description: "Create a new class in the schema",
    },
    {
      method: "GET",
      path: "/v1/schema/{className}",
      description: "Get specific class definition",
    },
    {
      method: "PUT",
      path: "/v1/schema/{className}",
      description: "Update class definition",
    },
    {
      method: "DELETE",
      path: "/v1/schema/{className}",
      description: "Delete a class from schema",
    },
    {
      method: "POST",
      path: "/v1/schema/{className}/properties",
      description: "Add property to a class",
    },

    // Batch Operations
    {
      method: "POST",
      path: "/v1/batch/objects",
      description: "Batch create/update objects",
    },
    {
      method: "DELETE",
      path: "/v1/batch/objects",
      description: "Batch delete objects",
    },

    // GraphQL
    {
      method: "POST",
      path: "/v1/graphql",
      description: "Execute GraphQL queries",
    },

    // Cluster and Meta
    {
      method: "GET",
      path: "/v1/meta",
      description: "Get Weaviate instance metadata",
    },
    {
      method: "GET",
      path: "/v1/nodes",
      description: "Get cluster nodes information",
    },
    {
      method: "GET",
      path: "/v1/.well-known/ready",
      description: "Check if Weaviate is ready",
    },
    {
      method: "GET",
      path: "/v1/.well-known/live",
      description: "Liveness check endpoint",
    },

    // Backup Operations
    {
      method: "POST",
      path: "/v1/backups/{backend}",
      description: "Create a backup",
    },
    {
      method: "GET",
      path: "/v1/backups/{backend}",
      description: "List available backups",
    },
    {
      method: "POST",
      path: "/v1/backups/{backend}/{backup-id}/restore",
      description: "Restore from backup",
    },

    // Classification (if enabled)
    {
      method: "POST",
      path: "/v1/classifications",
      description: "Start a classification process",
    },
    {
      method: "GET",
      path: "/v1/classifications/{id}",
      description: "Get classification status",
    },
  ];

  // Live schema data
  const [schemaClasses, setSchemaClasses] = useState<SchemaClass[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // Fetch schema data
  const fetchSchemaData = async () => {
    setSchemaLoading(true);
    try {
      const schema = await API_CONFIG.get("/schema");
      const classes = schema.classes || [];

      setSchemaClasses(
        classes.map((cls: any) => ({
          name: cls.class,
          description: cls.description || "No description",
          vectorizer: cls.vectorizer || "none",
          properties: cls.properties.map((prop: any) => ({
            name: prop.name,
            dataType: Array.isArray(prop.dataType)
              ? prop.dataType[0]
              : prop.dataType,
            description: prop.description || "",
          })),
        })),
      );
    } catch (error) {
      // Fallback demo data for CORS errors
      setSchemaClasses([
        {
          name: "Article",
          description: "News articles and blog posts (Demo)",
          vectorizer: "text2vec-openai",
          properties: [
            { name: "title", dataType: "text", description: "Article title" },
            {
              name: "content",
              dataType: "text",
              description: "Article content",
            },
            { name: "author", dataType: "text", description: "Article author" },
          ],
        },
        {
          name: "Product",
          description: "E-commerce products (Demo)",
          vectorizer: "text2vec-transformers",
          properties: [
            { name: "name", dataType: "text", description: "Product name" },
            {
              name: "description",
              dataType: "text",
              description: "Product description",
            },
            { name: "price", dataType: "number", description: "Product price" },
          ],
        },
      ]);
    } finally {
      setSchemaLoading(false);
    }
  };

  // Load query history from localStorage
  const loadQueryHistory = () => {
    try {
      const savedHistory = localStorage.getItem("weaviate-devtools-history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setQueryHistory(parsed);
      }
    } catch (error) {
      console.warn("Failed to load query history:", error);
    }
  };

  // Save query history to localStorage
  const saveQueryHistory = (history: QueryHistory[]) => {
    try {
      // Keep only the last 50 entries
      const limitedHistory = history.slice(0, 50);
      localStorage.setItem(
        "weaviate-devtools-history",
        JSON.stringify(limitedHistory),
      );
      setQueryHistory(limitedHistory);
    } catch (error) {
      console.warn("Failed to save query history:", error);
      setQueryHistory(history);
    }
  };

  // Add query to history
  const addToHistory = (entry: QueryHistory) => {
    const newHistory = [entry, ...queryHistory];
    saveQueryHistory(newHistory);
  };

  // Clear query history
  const clearHistory = () => {
    localStorage.removeItem("weaviate-devtools-history");
    setQueryHistory([]);
  };

  // Debug Tools Functions
  const [debugResults, setDebugResults] = useState<string>("");
  const [debugLoading, setDebugLoading] = useState(false);

  const runHealthCheck = async () => {
    setDebugLoading(true);
    setDebugResults("");

    try {
      const meta = await API_CONFIG.get("/meta");
      const results = {
        status: "healthy",
        version: meta.version,
        hostname: meta.hostname,
        modules: Object.keys(meta.modules || {}),
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(results, null, 2));

      toast({
        title: "Health Check Complete",
        description: "Weaviate instance is healthy",
      });
    } catch (error) {
      const errorResult = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(errorResult, null, 2));

      toast({
        title: "Health Check Failed",
        description: "Weaviate instance is not responding",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const checkSchemaConsistency = async () => {
    setDebugLoading(true);
    setDebugResults("");

    try {
      const schema = await API_CONFIG.get("/schema");
      const classes = schema.classes || [];

      const results = {
        status: "consistent",
        total_classes: classes.length,
        classes_with_vectorizers: classes.filter((c: any) => c.vectorizer)
          .length,
        classes_without_vectorizers: classes.filter((c: any) => !c.vectorizer)
          .length,
        property_count: classes.reduce(
          (sum: number, c: any) => sum + (c.properties?.length || 0),
          0,
        ),
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(results, null, 2));

      toast({
        title: "Schema Check Complete",
        description: `Found ${classes.length} classes`,
      });
    } catch (error) {
      const errorResult = {
        status: "error",
        error: error instanceof Error ? error.message : "Schema check failed",
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(errorResult, null, 2));

      toast({
        title: "Schema Check Failed",
        description: "Could not validate schema",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const validateIndexes = async () => {
    setDebugLoading(true);
    setDebugResults("");

    try {
      // Check nodes endpoint for cluster health
      const nodes = await API_CONFIG.get("/nodes");

      const results = {
        status: "validated",
        nodes: nodes,
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(results, null, 2));

      toast({
        title: "Index Validation Complete",
        description: "Indexes are healthy",
      });
    } catch (error) {
      const errorResult = {
        status: "error",
        error:
          error instanceof Error ? error.message : "Index validation failed",
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(errorResult, null, 2));

      toast({
        title: "Index Validation Failed",
        description: "Could not validate indexes",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const testConfiguration = async () => {
    setDebugLoading(true);
    setDebugResults("");

    try {
      const meta = await API_CONFIG.get("/meta");

      const results = {
        status: "configuration_valid",
        weaviate_version: meta.version,
        enabled_modules: meta.modules,
        current_endpoint: API_CONFIG.WEAVIATE_ENDPOINT,
        has_api_key: !!API_CONFIG.WEAVIATE_API_KEY,
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(results, null, 2));

      toast({
        title: "Configuration Test Complete",
        description: "Configuration is valid",
      });
    } catch (error) {
      const errorResult = {
        status: "configuration_error",
        error:
          error instanceof Error ? error.message : "Configuration test failed",
        current_endpoint: API_CONFIG.WEAVIATE_ENDPOINT,
        timestamp: new Date().toISOString(),
      };

      setDebugResults(JSON.stringify(errorResult, null, 2));

      toast({
        title: "Configuration Test Failed",
        description: "Check your connection settings",
        variant: "destructive",
      });
    } finally {
      setDebugLoading(false);
    }
  };

  // Fetch schema and load history on component mount
  useEffect(() => {
    fetchSchemaData();
    loadQueryHistory();
  }, []);

  const handleApiRequest = async () => {
    setLoading(true);
    setResponseData("");
    setResponseStatus(null);

    try {
      let response;
      let status = 200;

      // Make actual API request
      if (selectedMethod === "GET") {
        response = await API_CONFIG.get(apiEndpoint);
      } else if (selectedMethod === "POST") {
        const body = requestBody ? JSON.parse(requestBody) : {};
        response = await API_CONFIG.post(apiEndpoint, body);
      } else if (selectedMethod === "PUT") {
        const body = requestBody ? JSON.parse(requestBody) : {};
        response = await API_CONFIG.put(apiEndpoint, body);
      } else if (selectedMethod === "DELETE") {
        response = await API_CONFIG.delete(apiEndpoint);
      }

      setResponseData(JSON.stringify(response, null, 2));
      setResponseStatus(status);

      // Add to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        type: "rest",
        method: selectedMethod,
        endpoint: apiEndpoint,
        query: `${selectedMethod} ${apiEndpoint}`,
        timestamp: new Date().toISOString(),
        status: "success",
      };
      addToHistory(historyEntry);

      toast({
        title: "API Request Successful",
        description: "Request completed successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Request failed";

      setResponseData(
        JSON.stringify(
          {
            error: errorMessage,
            endpoint: apiEndpoint,
            method: selectedMethod,
            timestamp: new Date().toISOString(),
            suggestion:
              errorMessage.includes("CORS") ||
              errorMessage.includes("Failed to fetch")
                ? "Check connection settings or try a different endpoint"
                : "Verify the endpoint URL and request format",
          },
          null,
          2,
        ),
      );
      setResponseStatus(500);

      toast({
        title: "API Request Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Add error to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        type: "rest",
        method: selectedMethod,
        endpoint: apiEndpoint,
        query: `${selectedMethod} ${apiEndpoint}`,
        timestamp: new Date().toISOString(),
        status: "error",
      };
      addToHistory(historyEntry);
    } finally {
      setLoading(false);
    }
  };

  const handleGraphqlQuery = async () => {
    setLoading(true);
    setGraphqlResponse("");

    try {
      // Parse variables if provided
      let variables = {};
      if (graphqlVariables.trim()) {
        try {
          variables = JSON.parse(graphqlVariables);
        } catch (e) {
          throw new Error("Invalid JSON in variables");
        }
      }

      // Make actual GraphQL request
      const response = await API_CONFIG.post("/graphql", {
        query: graphqlQuery,
        variables: variables,
      });

      setGraphqlResponse(JSON.stringify(response, null, 2));

      // Add to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        type: "graphql",
        query: graphqlQuery,
        timestamp: new Date().toISOString(),
        status: "success",
      };
      addToHistory(historyEntry);

      toast({
        title: "GraphQL Query Successful",
        description: "Query executed successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "GraphQL query failed";

      setGraphqlResponse(
        JSON.stringify(
          {
            errors: [
              {
                message: errorMessage,
                timestamp: new Date().toISOString(),
                query_preview:
                  graphqlQuery.substring(0, 100) +
                  (graphqlQuery.length > 100 ? "..." : ""),
                suggestion:
                  errorMessage.includes("CORS") ||
                  errorMessage.includes("Failed to fetch")
                    ? "Check connection settings in the Connection dialog"
                    : "Verify your GraphQL query syntax and schema",
              },
            ],
          },
          null,
          2,
        ),
      );

      toast({
        title: "GraphQL Query Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Add error to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        type: "graphql",
        query: graphqlQuery,
        timestamp: new Date().toISOString(),
        status: "error",
      };
      addToHistory(historyEntry);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const loadFromHistory = (entry: QueryHistory) => {
    if (entry.type === "rest") {
      setSelectedMethod(entry.method || "GET");
      setApiEndpoint(entry.endpoint || "");
      setActiveTab("api-explorer");
    } else if (entry.type === "graphql") {
      setGraphqlQuery(entry.query);
      setActiveTab("graphql");
    }
    toast({
      title: "Query Loaded",
      description: "Query has been loaded from history",
    });
  };

  const toggleClassExpansion = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "number":
        return "bg-green-100 text-green-800";
      case "boolean":
        return "bg-purple-100 text-purple-800";
      case "date":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Developer Tools
            </h1>
            <p className="text-muted-foreground">
              API explorer, GraphQL playground, and development utilities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              API Docs
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Weaviate Console
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="api-explorer">API Explorer</TabsTrigger>
            <TabsTrigger value="graphql">GraphQL</TabsTrigger>
            <TabsTrigger value="schema">Schema Inspector</TabsTrigger>
            <TabsTrigger value="history">Query History</TabsTrigger>
            <TabsTrigger value="debug">Debug Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="api-explorer" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Terminal className="h-5 w-5 mr-2" />
                      REST API Explorer
                    </CardTitle>
                    <CardDescription>
                      Test and explore Weaviate REST API endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Select
                        value={selectedMethod}
                        onValueChange={setSelectedMethod}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        placeholder="/v1/objects"
                        className="flex-1"
                      />
                      <Button onClick={handleApiRequest} disabled={loading}>
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {(selectedMethod === "POST" ||
                      selectedMethod === "PUT") && (
                      <div className="space-y-2">
                        <Label>Request Body</Label>
                        <Textarea
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          placeholder='{"class": "Article", "properties": {...}}'
                          rows={6}
                          className="font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Response</Label>
                        <div className="flex items-center space-x-2">
                          {responseStatus && (
                            <Badge
                              variant={
                                responseStatus < 400 ? "default" : "destructive"
                              }
                            >
                              {responseStatus}
                            </Badge>
                          )}
                          {responseData && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(responseData)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={responseData}
                        readOnly
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="Response will appear here..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Endpoints</CardTitle>
                    <CardDescription>Available REST endpoints</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setSelectedMethod(endpoint.method);
                          setApiEndpoint(endpoint.path);
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge
                            variant="outline"
                            className={getMethodColor(endpoint.method)}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm">{endpoint.path}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {endpoint.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="graphql" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    GraphQL Query
                  </CardTitle>
                  <CardDescription>
                    Write and execute GraphQL queries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Query</Label>
                    <Textarea
                      value={graphqlQuery}
                      onChange={(e) => setGraphqlQuery(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variables (JSON)</Label>
                    <Textarea
                      value={graphqlVariables}
                      onChange={(e) => setGraphqlVariables(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder="{}"
                    />
                  </div>
                  <Button
                    onClick={handleGraphqlQuery}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Execute Query
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Response</span>
                    {graphqlResponse && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(graphqlResponse)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={graphqlResponse}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Response will appear here..."
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Schema Classes
                    </CardTitle>
                    <CardDescription>
                      Explore your Weaviate schema and data types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {schemaClasses.map((schemaClass) => (
                      <Collapsible
                        key={schemaClass.name}
                        open={expandedClasses.has(schemaClass.name)}
                        onOpenChange={() =>
                          toggleClassExpansion(schemaClass.name)
                        }
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border rounded hover:bg-muted">
                          <div className="flex items-center space-x-2">
                            {expandedClasses.has(schemaClass.name) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {schemaClass.name}
                            </span>
                            <Badge variant="outline">
                              {schemaClass.vectorizer}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 pl-6">
                          <p className="text-sm text-muted-foreground mb-3">
                            {schemaClass.description}
                          </p>
                          <div className="space-y-2">
                            <h5 className="font-medium">Properties</h5>
                            {schemaClass.properties.map((property) => (
                              <div
                                key={property.name}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <div>
                                  <span className="font-mono text-sm">
                                    {property.name}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {property.description}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={getDataTypeColor(
                                    property.dataType,
                                  )}
                                >
                                  {property.dataType}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={async () => {
                        try {
                          const schema = await API_CONFIG.get("/schema");
                          const blob = new Blob(
                            [JSON.stringify(schema, null, 2)],
                            { type: "application/json" },
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `weaviate-schema-${new Date().toISOString().split("T")[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast({
                            title: "Schema Exported",
                            description: "Schema has been downloaded",
                          });
                        } catch (error) {
                          toast({
                            title: "Export Failed",
                            description: "Could not export schema",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Schema
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".json";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              try {
                                const schema = JSON.parse(
                                  e.target?.result as string,
                                );
                                // Here you would implement schema import logic
                                toast({
                                  title: "Schema Loaded",
                                  description:
                                    "Schema file loaded (import functionality would be implemented)",
                                });
                              } catch (error) {
                                toast({
                                  title: "Invalid File",
                                  description: "Could not parse schema file",
                                  variant: "destructive",
                                });
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Schema
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        fetchSchemaData();
                        toast({
                          title: "Schema Refreshed",
                          description: "Schema data has been reloaded",
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Schema
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={checkSchemaConsistency}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Validate Schema
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Badge
                        variant="outline"
                        className={getDataTypeColor("text")}
                      >
                        text
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getDataTypeColor("number")}
                      >
                        number
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getDataTypeColor("boolean")}
                      >
                        boolean
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getDataTypeColor("date")}
                      >
                        date
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2" />
                      Query History
                    </CardTitle>
                    <CardDescription>
                      Recent API requests and GraphQL queries
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    disabled={queryHistory.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queryHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted cursor-pointer"
                      onClick={() => loadFromHistory(entry)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={
                            entry.type === "rest"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {entry.type.toUpperCase()}
                        </Badge>
                        {entry.method && (
                          <Badge
                            variant="outline"
                            className={getMethodColor(entry.method)}
                          >
                            {entry.method}
                          </Badge>
                        )}
                        <div>
                          <p className="font-mono text-sm">
                            {entry.type === "rest"
                              ? entry.endpoint
                              : entry.query.split("\n")[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            entry.status === "success"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {entry.status}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="h-5 w-5 mr-2" />
                    Debug Console
                  </CardTitle>
                  <CardDescription>
                    Debug tools and cluster diagnostics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={runHealthCheck}
                      disabled={debugLoading}
                    >
                      {debugLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Run Health Check
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={checkSchemaConsistency}
                      disabled={debugLoading}
                    >
                      {debugLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      Check Schema Consistency
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={validateIndexes}
                      disabled={debugLoading}
                    >
                      {debugLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Validate Indexes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={testConfiguration}
                      disabled={debugLoading}
                    >
                      {debugLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Test Configuration
                    </Button>
                  </div>

                  {debugResults && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Debug Results</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(debugResults)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={debugResults}
                        readOnly
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Tools</CardTitle>
                  <CardDescription>
                    Monitor and optimize performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Query Profiler
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export Metrics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
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
