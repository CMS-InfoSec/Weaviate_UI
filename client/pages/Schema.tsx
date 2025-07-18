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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import API_CONFIG from "@/lib/api";

interface Property {
  name: string;
  dataType: string | string[];
  description?: string;
  tokenization?: string;
  vectorizePropertyName?: boolean;
  indexInverted?: boolean;
  indexSearchable?: boolean;
  moduleConfig?: any;
}

interface WeaviateClass {
  class: string;
  description?: string;
  properties: Property[];
  vectorizer?: string;
  vectorIndexType?: string;
  vectorIndexConfig?: any;
  moduleConfig?: any;
  invertedIndexConfig?: any;
  multiTenancyConfig?: any;
  replicationConfig?: any;
  shardingConfig?: any;
}

interface SchemaResponse {
  classes: WeaviateClass[];
}

export default function Schema() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<WeaviateClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<WeaviateClass | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // Form states for creating new class
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [newClassVectorizer, setNewClassVectorizer] =
    useState("text2vec-openai");

  // Fetch schema from Weaviate
  const fetchSchema = async () => {
    try {
      const schema: SchemaResponse = await API_CONFIG.get("/schema");
      setClasses(schema.classes || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch schema";
      console.error("Schema fetch error:", errorMessage);

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. Showing demo data.",
        );
        // Fallback demo data for development
        setClasses([
          {
            class: "Article",
            description: "News articles and blog posts (Demo)",
            vectorizer: "text2vec-openai",
            vectorIndexType: "hnsw",
            properties: [
              {
                name: "title",
                dataType: ["text"],
                description: "Article title",
                tokenization: "word",
                vectorizePropertyName: false,
              },
              {
                name: "content",
                dataType: ["text"],
                description: "Article content",
                tokenization: "word",
              },
              {
                name: "author",
                dataType: ["text"],
                description: "Article author",
              },
              {
                name: "publishedAt",
                dataType: ["date"],
                description: "Publication date",
              },
            ],
          },
          {
            class: "Product",
            description: "E-commerce products (Demo)",
            vectorizer: "text2vec-transformers",
            vectorIndexType: "hnsw",
            properties: [
              {
                name: "name",
                dataType: ["text"],
                description: "Product name",
              },
              {
                name: "description",
                dataType: ["text"],
                description: "Product description",
              },
              {
                name: "price",
                dataType: ["number"],
                description: "Product price",
              },
            ],
          },
        ]);

        toast({
          title: "Development Mode",
          description:
            "CORS prevents live connection. Showing demo schema data.",
          variant: "default",
        });
      } else {
        setError(errorMessage);
        setClasses([]);
        toast({
          title: "Schema Error",
          description: `Could not fetch schema: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Create new class
  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: "Validation Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newClass = {
        class: newClassName,
        description: newClassDescription,
        vectorizer: newClassVectorizer,
        properties: [],
      };

      // Try to create the class via API
      await API_CONFIG.post("/schema", newClass);

      // Refresh schema
      await fetchSchema();

      // Reset form
      setNewClassName("");
      setNewClassDescription("");
      setNewClassVectorizer("text2vec-openai");
      setShowCreateDialog(false);

      toast({
        title: "Class Created",
        description: `Class "${newClassName}" has been created successfully.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create class";

      if (errorMessage.includes("CORS")) {
        // In development, just add to local state for demo
        const demoClass: WeaviateClass = {
          class: newClassName,
          description: newClassDescription + " (Demo - not saved)",
          vectorizer: newClassVectorizer,
          vectorIndexType: "hnsw",
          properties: [],
        };

        setClasses([...classes, demoClass]);
        setNewClassName("");
        setNewClassDescription("");
        setShowCreateDialog(false);

        toast({
          title: "Demo Mode",
          description:
            "Class added locally (not saved to Weaviate due to CORS).",
        });
      } else {
        toast({
          title: "Creation Error",
          description: `Could not create class: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Delete class
  const handleDeleteClass = async (className: string) => {
    try {
      await API_CONFIG.delete(`/schema/${className}`);
      await fetchSchema();
      setShowDeleteDialog(null);

      toast({
        title: "Class Deleted",
        description: `Class "${className}" has been deleted successfully.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete class";

      if (errorMessage.includes("CORS")) {
        // In development, just remove from local state
        setClasses(classes.filter((c) => c.class !== className));
        setShowDeleteDialog(null);

        toast({
          title: "Demo Mode",
          description:
            "Class removed locally (not deleted from Weaviate due to CORS).",
        });
      } else {
        toast({
          title: "Deletion Error",
          description: `Could not delete class: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Export schema
  const handleExportSchema = () => {
    const schemaData = { classes };
    const blob = new Blob([JSON.stringify(schemaData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weaviate-schema.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Schema Exported",
      description: "Schema has been exported successfully.",
    });
  };

  // Refresh schema
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchema();
    setRefreshing(false);

    toast({
      title: "Schema Refreshed",
      description: "Schema data has been updated from Weaviate.",
    });
  };

  // Initial load
  useEffect(() => {
    const loadSchema = async () => {
      setLoading(true);
      await fetchSchema();
      setLoading(false);
    };

    loadSchema();
  }, []);

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (cls) =>
      cls.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description &&
        cls.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getDataTypeColor = (dataType: string | string[]) => {
    const typeStr = Array.isArray(dataType) ? dataType[0] : dataType;
    switch (typeStr) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "number":
      case "int":
        return "bg-green-100 text-green-800";
      case "boolean":
        return "bg-purple-100 text-purple-800";
      case "date":
        return "bg-orange-100 text-orange-800";
      case "uuid":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Loading Schema</h2>
                <p className="text-muted-foreground">
                  Fetching schema from Weaviate instance...
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
              Schema Management
            </h1>
            <p className="text-muted-foreground">
              Manage classes and properties in your Weaviate schema
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
            <Button onClick={handleExportSchema} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Define a new class in your Weaviate schema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Article"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classDescription">Description</Label>
                    <Textarea
                      id="classDescription"
                      value={newClassDescription}
                      onChange={(e) => setNewClassDescription(e.target.value)}
                      placeholder="Description of this class..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vectorizer">Vectorizer</Label>
                    <Select
                      value={newClassVectorizer}
                      onValueChange={setNewClassVectorizer}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text2vec-openai">
                          text2vec-openai
                        </SelectItem>
                        <SelectItem value="text2vec-transformers">
                          text2vec-transformers
                        </SelectItem>
                        <SelectItem value="text2vec-cohere">
                          text2vec-cohere
                        </SelectItem>
                        <SelectItem value="none">none</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateClass}>Create Class</Button>
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredClasses.length} of {classes.length} classes
          </div>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Schema Classes
            </CardTitle>
            <CardDescription>
              All classes defined in your Weaviate schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Classes Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No classes match your search."
                    : "Your schema is empty."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Class
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Vectorizer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.class}>
                      <TableCell className="font-medium">{cls.class}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cls.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cls.properties.slice(0, 3).map((prop) => (
                            <Badge
                              key={prop.name}
                              variant="outline"
                              className={getDataTypeColor(prop.dataType)}
                            >
                              {prop.name}
                            </Badge>
                          ))}
                          {cls.properties.length > 3 && (
                            <Badge variant="outline">
                              +{cls.properties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cls.vectorizer || "none"}
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
                              onClick={() => setSelectedClass(cls)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Class
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy JSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setShowDeleteDialog(cls.class)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Class
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

        {/* Class Details Dialog */}
        {selectedClass && (
          <Dialog
            open={!!selectedClass}
            onOpenChange={() => setSelectedClass(null)}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Class Details: {selectedClass.class}</DialogTitle>
                <DialogDescription>
                  {selectedClass.description || "No description available"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vectorizer</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedClass.vectorizer || "none"}
                    </p>
                  </div>
                  <div>
                    <Label>Vector Index Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedClass.vectorIndexType || "hnsw"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Properties ({selectedClass.properties.length})</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {selectedClass.properties.map((prop) => (
                      <div key={prop.name} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{prop.name}</span>
                          <Badge
                            variant="outline"
                            className={getDataTypeColor(prop.dataType)}
                          >
                            {Array.isArray(prop.dataType)
                              ? prop.dataType.join(", ")
                              : prop.dataType}
                          </Badge>
                        </div>
                        {prop.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {prop.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!showDeleteDialog}
          onOpenChange={() => setShowDeleteDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the class "{showDeleteDialog}"?
                This action cannot be undone and will remove all associated
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  showDeleteDialog && handleDeleteClass(showDeleteDialog)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Class
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
