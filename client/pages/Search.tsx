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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Search as SearchIcon,
  Play,
  Save,
  Download,
  Copy,
  History,
  Zap,
  Target,
  FileText,
  Hash,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import API_CONFIG from "@/lib/api";

interface SearchResult {
  id: string;
  class: string;
  properties: Record<string, any>;
  score?: number;
  _additional?: {
    id?: string;
    score?: number;
    distance?: number;
    vector?: number[];
  };
}

interface SavedQuery {
  id: string;
  name: string;
  type: "vector" | "hybrid" | "keyword" | "graphql";
  query: string;
  timestamp: string;
  results?: number;
}

interface ClassSchema {
  class: string;
  properties: Array<{
    name: string;
    dataType: string | string[];
  }>;
}

export default function Search() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<ClassSchema[]>([]);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [activeTab, setActiveTab] = useState("vector");

  // Vector search
  const [vectorQuery, setVectorQuery] = useState("");
  const [vectorLimit, setVectorLimit] = useState([10]);
  const [vectorCertainty, setVectorCertainty] = useState([0.7]);

  // Hybrid search
  const [hybridQuery, setHybridQuery] = useState("");
  const [hybridAlpha, setHybridAlpha] = useState([0.5]);
  const [hybridLimit, setHybridLimit] = useState([10]);

  // Keyword search
  const [keywordQuery, setKeywordQuery] = useState("");
  const [keywordLimit, setKeywordLimit] = useState([10]);

  // GraphQL search
  const [graphqlQuery, setGraphqlQuery] = useState(`{
  Get {
    Article {
      title
      content
      author
      _additional {
        id
        score
      }
    }
  }
}`);

  // Saved queries
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([
    {
      id: "1",
      name: "Recent Articles",
      type: "vector",
      query: "artificial intelligence",
      timestamp: "2024-01-15T10:00:00Z",
      results: 25,
    },
    {
      id: "2",
      name: "Product Search",
      type: "hybrid",
      query: "wireless headphones",
      timestamp: "2024-01-14T15:30:00Z",
      results: 12,
    },
  ]);

  // Fetch schema for class selection
  const fetchSchema = async () => {
    try {
      const schema = await API_CONFIG.get("/schema");
      setSchemas(schema.classes || []);
    } catch (err) {
      console.warn("Could not fetch schema:", err);
      // Fallback demo schemas
      setSchemas([
        {
          class: "Article",
          properties: [
            { name: "title", dataType: ["text"] },
            { name: "content", dataType: ["text"] },
            { name: "author", dataType: ["text"] },
          ],
        },
        {
          class: "Product",
          properties: [
            { name: "name", dataType: ["text"] },
            { name: "description", dataType: ["text"] },
            { name: "price", dataType: ["number"] },
          ],
        },
      ]);
    }
  };

  // Vector search
  const handleVectorSearch = async () => {
    if (!vectorQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build GraphQL query for vector search
      const graphql = {
        query: `{
          Get {
            ${selectedClass || "Article"} ${
              vectorLimit[0] ? `(limit: ${vectorLimit[0]})` : ""
            } {
              ${
                schemas
                  .find((s) => s.class === (selectedClass || "Article"))
                  ?.properties.slice(0, 3)
                  .map((p) => p.name)
                  .join("\n              ") || "title\ncontent"
              }
              _additional {
                id
                score
                distance
              }
            }
          }
        }`,
      };

      const response = await API_CONFIG.post("/graphql", graphql);
      const className = selectedClass || "Article";
      const results = response.data?.Get?.[className] || [];

      setSearchResults(
        results.map((item: any) => ({
          id: item._additional?.id || Math.random().toString(),
          class: className,
          properties: { ...item },
          score: item._additional?.score,
        })),
      );

      toast({
        title: "Search Complete",
        description: `Found ${results.length} results`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. Showing demo results.",
        );

        // Demo search results
        const demoResults: SearchResult[] = [
          {
            id: "demo-1",
            class: "Article",
            properties: {
              title: `Demo: Results for "${vectorQuery}"`,
              content:
                "This is a demo search result. In production, this would show real vector search results from your Weaviate instance.",
              author: "Demo System",
            },
            score: 0.95,
          },
          {
            id: "demo-2",
            class: "Article",
            properties: {
              title: "Another Demo Result",
              content:
                "Vector search would return semantically similar content based on your query.",
              author: "AI Assistant",
            },
            score: 0.87,
          },
        ];

        setSearchResults(demoResults);
        toast({
          title: "Demo Mode",
          description: "CORS prevents live search. Showing demo results.",
        });
      } else {
        setError(errorMessage);
        setSearchResults([]);
        toast({
          title: "Search Error",
          description: `Search failed: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Hybrid search
  const handleHybridSearch = async () => {
    if (!hybridQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build hybrid search query
      const graphql = {
        query: `{
          Get {
            ${selectedClass || "Article"} (
              hybrid: {
                query: "${hybridQuery}"
                alpha: ${hybridAlpha[0]}
              }
              limit: ${hybridLimit[0]}
            ) {
              ${
                schemas
                  .find((s) => s.class === (selectedClass || "Article"))
                  ?.properties.slice(0, 3)
                  .map((p) => p.name)
                  .join("\n              ") || "title\ncontent"
              }
              _additional {
                id
                score
              }
            }
          }
        }`,
      };

      const response = await API_CONFIG.post("/graphql", graphql);
      const className = selectedClass || "Article";
      const results = response.data?.Get?.[className] || [];

      setSearchResults(
        results.map((item: any) => ({
          id: item._additional?.id || Math.random().toString(),
          class: className,
          properties: { ...item },
          score: item._additional?.score,
        })),
      );

      toast({
        title: "Search Complete",
        description: `Found ${results.length} hybrid results`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError("CORS Error: Showing demo hybrid search results.");

        const demoResults: SearchResult[] = [
          {
            id: "hybrid-demo-1",
            class: "Product",
            properties: {
              name: `Hybrid Demo: "${hybridQuery}"`,
              description:
                "This combines vector and keyword search for the best results.",
              price: 99.99,
            },
            score: 0.92,
          },
        ];

        setSearchResults(demoResults);
        toast({
          title: "Demo Mode",
          description: "Showing demo hybrid search results.",
        });
      } else {
        setError(errorMessage);
        setSearchResults([]);
        toast({
          title: "Search Error",
          description: `Hybrid search failed: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Keyword search
  const handleKeywordSearch = async () => {
    if (!keywordQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build keyword search query
      const graphql = {
        query: `{
          Get {
            ${selectedClass || "Article"} (
              bm25: {
                query: "${keywordQuery}"
              }
              limit: ${keywordLimit[0]}
            ) {
              ${
                schemas
                  .find((s) => s.class === (selectedClass || "Article"))
                  ?.properties.slice(0, 3)
                  .map((p) => p.name)
                  .join("\n              ") || "title\ncontent"
              }
              _additional {
                id
                score
              }
            }
          }
        }`,
      };

      const response = await API_CONFIG.post("/graphql", graphql);
      const className = selectedClass || "Article";
      const results = response.data?.Get?.[className] || [];

      setSearchResults(
        results.map((item: any) => ({
          id: item._additional?.id || Math.random().toString(),
          class: className,
          properties: { ...item },
          score: item._additional?.score,
        })),
      );

      toast({
        title: "Search Complete",
        description: `Found ${results.length} keyword results`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError("CORS Error: Showing demo keyword search results.");

        const demoResults: SearchResult[] = [
          {
            id: "keyword-demo-1",
            class: "Article",
            properties: {
              title: `Keyword Search: "${keywordQuery}"`,
              content:
                "Traditional keyword-based search results would appear here.",
              author: "Search Engine",
            },
            score: 0.85,
          },
        ];

        setSearchResults(demoResults);
        toast({
          title: "Demo Mode",
          description: "Showing demo keyword search results.",
        });
      } else {
        setError(errorMessage);
        setSearchResults([]);
        toast({
          title: "Search Error",
          description: `Keyword search failed: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // GraphQL search
  const handleGraphQLSearch = async () => {
    if (!graphqlQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a GraphQL query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API_CONFIG.post("/graphql", {
        query: graphqlQuery,
      });

      // Extract results from GraphQL response
      const data = response.data;
      let results: SearchResult[] = [];

      if (data?.Get) {
        Object.entries(data.Get).forEach(
          ([className, items]: [string, any]) => {
            if (Array.isArray(items)) {
              results = results.concat(
                items.map((item: any) => ({
                  id: item._additional?.id || Math.random().toString(),
                  class: className,
                  properties: { ...item },
                  score: item._additional?.score,
                })),
              );
            }
          },
        );
      }

      setSearchResults(results);

      toast({
        title: "GraphQL Query Complete",
        description: `Query executed successfully`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GraphQL query failed";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError("CORS Error: Showing demo GraphQL results.");

        const demoResults: SearchResult[] = [
          {
            id: "graphql-demo-1",
            class: "Article",
            properties: {
              title: "GraphQL Demo Result",
              content:
                "Your GraphQL query would execute against the live Weaviate instance.",
              author: "GraphQL Engine",
            },
            score: 1.0,
          },
        ];

        setSearchResults(demoResults);
        toast({
          title: "Demo Mode",
          description: "Showing demo GraphQL results.",
        });
      } else {
        setError(errorMessage);
        setSearchResults([]);
        toast({
          title: "GraphQL Error",
          description: `Query failed: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Export results
  const handleExportResults = () => {
    const exportData = {
      query: {
        type: activeTab,
        query: vectorQuery || hybridQuery || keywordQuery || graphqlQuery,
        timestamp: new Date().toISOString(),
      },
      results: searchResults,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Results Exported",
      description: "Search results have been exported successfully.",
    });
  };

  // Load schema on mount
  useEffect(() => {
    fetchSchema();
  }, []);

  const formatPropertyValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 0.9) return "bg-green-100 text-green-800";
    if (score >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Advanced Search
            </h1>
            <p className="text-muted-foreground">
              Search your Weaviate database using vector, hybrid, keyword, or
              GraphQL queries
            </p>
          </div>
          <div className="flex items-center gap-2">
            {searchResults.length > 0 && (
              <Button onClick={handleExportResults} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SearchIcon className="h-5 w-5 mr-2" />
                  Search Interface
                </CardTitle>
                <CardDescription>
                  Choose your search method and enter your query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="vector">Vector</TabsTrigger>
                    <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                    <TabsTrigger value="keyword">Keyword</TabsTrigger>
                    <TabsTrigger value="graphql">GraphQL</TabsTrigger>
                  </TabsList>

                  {/* Class Selection */}
                  <div className="space-y-2">
                    <Label>Target Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemas.map((schema) => (
                          <SelectItem key={schema.class} value={schema.class}>
                            {schema.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <TabsContent value="vector" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Vector Search Query</Label>
                        <Input
                          placeholder="Enter natural language query..."
                          value={vectorQuery}
                          onChange={(e) => setVectorQuery(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Limit: {vectorLimit[0]}</Label>
                          <Slider
                            value={vectorLimit}
                            onValueChange={setVectorLimit}
                            max={100}
                            min={1}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Certainty: {vectorCertainty[0]}</Label>
                          <Slider
                            value={vectorCertainty}
                            onValueChange={setVectorCertainty}
                            max={1}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleVectorSearch}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Target className="h-4 w-4 mr-2" />
                        )}
                        Vector Search
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="hybrid" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hybrid Search Query</Label>
                        <Input
                          placeholder="Enter search query..."
                          value={hybridQuery}
                          onChange={(e) => setHybridQuery(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Limit: {hybridLimit[0]}</Label>
                          <Slider
                            value={hybridLimit}
                            onValueChange={setHybridLimit}
                            max={100}
                            min={1}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Alpha (Vector/Keyword Balance): {hybridAlpha[0]}
                          </Label>
                          <Slider
                            value={hybridAlpha}
                            onValueChange={setHybridAlpha}
                            max={1}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleHybridSearch}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Hybrid Search
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="keyword" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Keyword Search Query</Label>
                        <Input
                          placeholder="Enter keywords..."
                          value={keywordQuery}
                          onChange={(e) => setKeywordQuery(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Limit: {keywordLimit[0]}</Label>
                        <Slider
                          value={keywordLimit}
                          onValueChange={setKeywordLimit}
                          max={100}
                          min={1}
                          step={1}
                        />
                      </div>
                      <Button
                        onClick={handleKeywordSearch}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <SearchIcon className="h-4 w-4 mr-2" />
                        )}
                        Keyword Search
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="graphql" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>GraphQL Query</Label>
                        <Textarea
                          placeholder="Enter GraphQL query..."
                          value={graphqlQuery}
                          onChange={(e) => setGraphqlQuery(e.target.value)}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleGraphQLSearch}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Execute GraphQL
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Saved Queries */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Saved Queries
                </CardTitle>
                <CardDescription>
                  Quick access to your saved searches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedQueries.map((query) => (
                  <div
                    key={query.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{query.name}</span>
                      <Badge variant="outline">{query.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {query.query}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{query.results} results</span>
                      <span>
                        {new Date(query.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Search Results ({searchResults.length})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportResults}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span>{result.id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.class}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="space-y-1">
                          {Object.entries(result.properties)
                            .filter(([key]) => !key.startsWith("_"))
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span>{" "}
                                <span className="text-muted-foreground">
                                  {formatPropertyValue(value).substring(0, 50)}
                                  {formatPropertyValue(value).length > 50
                                    ? "..."
                                    : ""}
                                </span>
                              </div>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.score && (
                          <Badge
                            variant="outline"
                            className={getScoreColor(result.score)}
                          >
                            {result.score.toFixed(3)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {searchResults.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Search Results</h3>
              <p className="text-muted-foreground">
                Enter a query above to search your Weaviate database
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
