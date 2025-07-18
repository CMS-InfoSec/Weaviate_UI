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
  User,
  Building,
  Eye,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  BookOpen,
  Code,
  Database,
} from "lucide-react";
import { useState } from "react";

interface SearchResult {
  id: string;
  className: string;
  properties: Record<string, any>;
  score?: number;
  distance?: number;
  createdAt: string;
}

interface SearchQuery {
  id: string;
  name: string;
  type: "vector" | "hybrid" | "keyword" | "graphql";
  query: string;
  parameters: Record<string, any>;
  createdAt: string;
  lastUsed: string;
}

export default function Search() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("vector");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Search form states
  const [vectorSearch, setVectorSearch] = useState({
    query: "",
    className: "",
    limit: 10,
    offset: 0,
    certainty: 0.7,
    distance: 0.3,
    fields: [] as string[],
  });

  const [hybridSearch, setHybridSearch] = useState({
    query: "",
    className: "",
    limit: 10,
    alpha: 0.75,
    vector: "",
    keyword: "",
    fields: [] as string[],
  });

  const [keywordSearch, setKeywordSearch] = useState({
    query: "",
    className: "",
    limit: 10,
    properties: [] as string[],
    operator: "and" as "and" | "or",
  });

  const [graphqlQuery, setGraphqlQuery] = useState(`{
  Get {
    Article(limit: 10) {
      title
      content
      author
      _additional {
        id
        certainty
      }
    }
  }
}`);

  const [savedQueries, setSavedQueries] = useState<SearchQuery[]>([
    {
      id: "query-1",
      name: "Find AI Articles",
      type: "vector",
      query: "artificial intelligence machine learning",
      parameters: { className: "Article", limit: 20, certainty: 0.8 },
      createdAt: "2024-01-15T10:30:00Z",
      lastUsed: "2024-01-20T14:22:00Z",
    },
    {
      id: "query-2",
      name: "Tech Companies",
      type: "keyword",
      query: "technology startup",
      parameters: { className: "Company", limit: 15 },
      createdAt: "2024-01-12T16:45:00Z",
      lastUsed: "2024-01-19T09:15:00Z",
    },
  ]);

  const [showSaveQuery, setShowSaveQuery] = useState(false);
  const [showQueryHistory, setShowQueryHistory] = useState(false);
  const [queryName, setQueryName] = useState("");

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      className: "Article",
      properties: {
        title: "Introduction to Vector Databases",
        content:
          "Vector databases are specialized databases designed to store and search vector embeddings...",
        author: "John Smith",
        category: "Technology",
      },
      score: 0.95,
      distance: 0.05,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      className: "Article",
      properties: {
        title: "Machine Learning Best Practices",
        content:
          "Building effective machine learning models requires understanding of data, algorithms...",
        author: "Jane Doe",
        category: "AI",
      },
      score: 0.87,
      distance: 0.13,
      createdAt: "2024-01-10T14:20:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      className: "Person",
      properties: {
        name: "Dr. Sarah Wilson",
        bio: "AI researcher specializing in natural language processing and vector embeddings",
        email: "sarah.wilson@university.edu",
      },
      score: 0.82,
      distance: 0.18,
      createdAt: "2024-01-08T12:00:00Z",
    },
  ];

  const classes = ["All Classes", "Article", "Person", "Company"];
  const availableFields = {
    Article: ["title", "content", "author", "category", "publishedDate"],
    Person: ["name", "bio", "email", "birthDate"],
    Company: ["name", "description", "industry", "foundedYear"],
  };

  // Execute search based on active tab
  const executeSearch = async () => {
    setIsSearching(true);
    const startTime = Date.now();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSearchResults(mockResults);
    setTotalResults(mockResults.length);
    setSearchTime(Date.now() - startTime);
    setIsSearching(false);

    toast({
      title: "Search Complete",
      description: `Found ${mockResults.length} results in ${Date.now() - startTime}ms`,
    });
  };

  // Save current query
  const saveCurrentQuery = () => {
    if (!queryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for this query",
        variant: "destructive",
      });
      return;
    }

    const newQuery: SearchQuery = {
      id: `query-${Date.now()}`,
      name: queryName,
      type: activeTab as any,
      query: getCurrentQuery(),
      parameters: getCurrentParameters(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    setSavedQueries([...savedQueries, newQuery]);
    setQueryName("");
    setShowSaveQuery(false);

    toast({
      title: "Query Saved",
      description: `"${newQuery.name}" has been saved to your query history`,
    });
  };

  // Get current query text
  const getCurrentQuery = () => {
    switch (activeTab) {
      case "vector":
        return vectorSearch.query;
      case "hybrid":
        return hybridSearch.query;
      case "keyword":
        return keywordSearch.query;
      case "graphql":
        return graphqlQuery;
      default:
        return "";
    }
  };

  // Get current parameters
  const getCurrentParameters = () => {
    switch (activeTab) {
      case "vector":
        return vectorSearch;
      case "hybrid":
        return hybridSearch;
      case "keyword":
        return keywordSearch;
      case "graphql":
        return { query: graphqlQuery };
      default:
        return {};
    }
  };

  // Load saved query
  const loadSavedQuery = (query: SearchQuery) => {
    setActiveTab(query.type);

    switch (query.type) {
      case "vector":
        setVectorSearch({ ...query.parameters, query: query.query });
        break;
      case "hybrid":
        setHybridSearch({ ...query.parameters, query: query.query });
        break;
      case "keyword":
        setKeywordSearch({ ...query.parameters, query: query.query });
        break;
      case "graphql":
        setGraphqlQuery(query.query);
        break;
    }

    setShowQueryHistory(false);
    toast({
      title: "Query Loaded",
      description: `"${query.name}" has been loaded`,
    });
  };

  // Export results
  const exportResults = () => {
    const exportData = {
      query: getCurrentQuery(),
      parameters: getCurrentParameters(),
      results: searchResults,
      metadata: {
        searchTime,
        totalResults,
        timestamp: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Search results exported successfully",
    });
  };

  // Get icon for object class
  const getClassIcon = (className: string) => {
    switch (className) {
      case "Article":
        return <FileText className="h-4 w-4" />;
      case "Person":
        return <User className="h-4 w-4" />;
      case "Company":
        return <Building className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Get color for object class
  const getClassColor = (className: string) => {
    switch (className) {
      case "Article":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Person":
        return "bg-green-100 text-green-800 border-green-200";
      case "Company":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Advanced Search
            </h1>
            <p className="text-muted-foreground mt-2">
              Perform vector, hybrid, and keyword searches with GraphQL query
              builder
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showQueryHistory} onOpenChange={setShowQueryHistory}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  Query History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Saved Queries</DialogTitle>
                  <DialogDescription>
                    Load and manage your saved search queries
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {savedQueries.map((query) => (
                    <Card
                      key={query.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{query.type}</Badge>
                            <h3 className="font-medium">{query.name}</h3>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadSavedQuery(query)}
                          >
                            Load Query
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {query.query}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Created:{" "}
                            {new Date(query.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Last used:{" "}
                            {new Date(query.lastUsed).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSaveQuery} onOpenChange={setShowSaveQuery}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Query
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Query</DialogTitle>
                  <DialogDescription>
                    Save the current search query for future use
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="queryName">Query Name</Label>
                    <Input
                      id="queryName"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="Enter a name for this query"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Query Preview</Label>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-mono">{getCurrentQuery()}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveQuery(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveCurrentQuery}>Save Query</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Search Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vector" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Vector Search
                </TabsTrigger>
                <TabsTrigger value="hybrid" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Hybrid Search
                </TabsTrigger>
                <TabsTrigger
                  value="keyword"
                  className="flex items-center gap-2"
                >
                  <SearchIcon className="h-4 w-4" />
                  Keyword Search
                </TabsTrigger>
                <TabsTrigger
                  value="graphql"
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  GraphQL
                </TabsTrigger>
              </TabsList>

              {/* Vector Search */}
              <TabsContent value="vector" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vectorQuery">Search Query</Label>
                      <Textarea
                        id="vectorQuery"
                        value={vectorSearch.query}
                        onChange={(e) =>
                          setVectorSearch({
                            ...vectorSearch,
                            query: e.target.value,
                          })
                        }
                        placeholder="Enter your search query..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vectorClass">Class</Label>
                      <Select
                        value={vectorSearch.className}
                        onValueChange={(value) =>
                          setVectorSearch({
                            ...vectorSearch,
                            className: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls.toLowerCase()}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vectorLimit">Limit</Label>
                        <Input
                          id="vectorLimit"
                          type="number"
                          value={vectorSearch.limit}
                          onChange={(e) =>
                            setVectorSearch({
                              ...vectorSearch,
                              limit: parseInt(e.target.value) || 10,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vectorOffset">Offset</Label>
                        <Input
                          id="vectorOffset"
                          type="number"
                          value={vectorSearch.offset}
                          onChange={(e) =>
                            setVectorSearch({
                              ...vectorSearch,
                              offset: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Certainty: {vectorSearch.certainty}</Label>
                      <Slider
                        value={[vectorSearch.certainty]}
                        onValueChange={(value) =>
                          setVectorSearch({
                            ...vectorSearch,
                            certainty: value[0],
                          })
                        }
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Distance: {vectorSearch.distance}</Label>
                      <Slider
                        value={[vectorSearch.distance]}
                        onValueChange={(value) =>
                          setVectorSearch({
                            ...vectorSearch,
                            distance: value[0],
                          })
                        }
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fields to Return</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {vectorSearch.className &&
                          availableFields[
                            vectorSearch.className as keyof typeof availableFields
                          ]?.map((field) => (
                            <div
                              key={field}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={field}
                                checked={vectorSearch.fields.includes(field)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setVectorSearch({
                                      ...vectorSearch,
                                      fields: [...vectorSearch.fields, field],
                                    });
                                  } else {
                                    setVectorSearch({
                                      ...vectorSearch,
                                      fields: vectorSearch.fields.filter(
                                        (f) => f !== field,
                                      ),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={field} className="text-sm">
                                {field}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Hybrid Search */}
              <TabsContent value="hybrid" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hybridQuery">Search Query</Label>
                      <Textarea
                        id="hybridQuery"
                        value={hybridSearch.query}
                        onChange={(e) =>
                          setHybridSearch({
                            ...hybridSearch,
                            query: e.target.value,
                          })
                        }
                        placeholder="Enter your hybrid search query..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hybridClass">Class</Label>
                      <Select
                        value={hybridSearch.className}
                        onValueChange={(value) =>
                          setHybridSearch({
                            ...hybridSearch,
                            className: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls.toLowerCase()}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hybridLimit">Results Limit</Label>
                      <Input
                        id="hybridLimit"
                        type="number"
                        value={hybridSearch.limit}
                        onChange={(e) =>
                          setHybridSearch({
                            ...hybridSearch,
                            limit: parseInt(e.target.value) || 10,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Alpha (Vector/Keyword Balance): {hybridSearch.alpha}
                      </Label>
                      <Slider
                        value={[hybridSearch.alpha]}
                        onValueChange={(value) =>
                          setHybridSearch({
                            ...hybridSearch,
                            alpha: value[0],
                          })
                        }
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>More Keyword</span>
                        <span>More Vector</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hybridVector">Vector Component</Label>
                      <Input
                        id="hybridVector"
                        value={hybridSearch.vector}
                        onChange={(e) =>
                          setHybridSearch({
                            ...hybridSearch,
                            vector: e.target.value,
                          })
                        }
                        placeholder="Vector search terms..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hybridKeyword">Keyword Component</Label>
                      <Input
                        id="hybridKeyword"
                        value={hybridSearch.keyword}
                        onChange={(e) =>
                          setHybridSearch({
                            ...hybridSearch,
                            keyword: e.target.value,
                          })
                        }
                        placeholder="Keyword search terms..."
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Keyword Search */}
              <TabsContent value="keyword" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keywordQuery">Search Query</Label>
                      <Textarea
                        id="keywordQuery"
                        value={keywordSearch.query}
                        onChange={(e) =>
                          setKeywordSearch({
                            ...keywordSearch,
                            query: e.target.value,
                          })
                        }
                        placeholder="Enter keywords to search for..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywordClass">Class</Label>
                      <Select
                        value={keywordSearch.className}
                        onValueChange={(value) =>
                          setKeywordSearch({
                            ...keywordSearch,
                            className: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls.toLowerCase()}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="keywordLimit">Limit</Label>
                        <Input
                          id="keywordLimit"
                          type="number"
                          value={keywordSearch.limit}
                          onChange={(e) =>
                            setKeywordSearch({
                              ...keywordSearch,
                              limit: parseInt(e.target.value) || 10,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="keywordOperator">Operator</Label>
                        <Select
                          value={keywordSearch.operator}
                          onValueChange={(value: "and" | "or") =>
                            setKeywordSearch({
                              ...keywordSearch,
                              operator: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Properties to Search</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {keywordSearch.className &&
                          availableFields[
                            keywordSearch.className as keyof typeof availableFields
                          ]?.map((field) => (
                            <div
                              key={field}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`keyword-${field}`}
                                checked={keywordSearch.properties.includes(
                                  field,
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setKeywordSearch({
                                      ...keywordSearch,
                                      properties: [
                                        ...keywordSearch.properties,
                                        field,
                                      ],
                                    });
                                  } else {
                                    setKeywordSearch({
                                      ...keywordSearch,
                                      properties:
                                        keywordSearch.properties.filter(
                                          (f) => f !== field,
                                        ),
                                    });
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`keyword-${field}`}
                                className="text-sm"
                              >
                                {field}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* GraphQL Query Builder */}
              <TabsContent value="graphql" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="graphqlQuery">GraphQL Query</Label>
                    <Textarea
                      id="graphqlQuery"
                      value={graphqlQuery}
                      onChange={(e) => setGraphqlQuery(e.target.value)}
                      placeholder="Enter your GraphQL query..."
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setGraphqlQuery(`{
  Get {
    Article(limit: 10) {
      title
      content
      author
      _additional {
        id
        certainty
      }
    }
  }
}`)
                      }
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Load Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(graphqlQuery);
                        toast({
                          title: "Copied",
                          description: "Query copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Query
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Search Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={executeSearch}
                  disabled={isSearching}
                  className="w-full"
                  size="lg"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isSearching ? "Searching..." : "Execute Search"}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <SearchIcon className="h-5 w-5" />
                    Search Results ({totalResults})
                  </CardTitle>
                  <CardDescription>
                    {searchTime && `Found in ${searchTime}ms`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <Card key={result.id} className="hover:bg-muted/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className={getClassColor(result.className)}>
                            <span className="flex items-center gap-1">
                              {getClassIcon(result.className)}
                              {result.className}
                            </span>
                          </Badge>
                          <div>
                            <h3 className="font-semibold">
                              {result.properties.title ||
                                result.properties.name ||
                                `${result.className} ${result.id.substring(0, 8)}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {result.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {result.score && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Score:{" "}
                              </span>
                              <span className="font-medium">
                                {result.score.toFixed(3)}
                              </span>
                            </div>
                          )}
                          {result.distance && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Distance:{" "}
                              </span>
                              <span className="font-medium">
                                {result.distance.toFixed(3)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.properties).map(
                          ([key, value]) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {key}
                              </Label>
                              <p className="text-sm">
                                {typeof value === "string" && value.length > 150
                                  ? `${value.substring(0, 150)}...`
                                  : String(value)}
                              </p>
                            </div>
                          ),
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
                        <span>
                          Created:{" "}
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
