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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  MoreHorizontal,
  Copy,
  Calendar,
  User,
  Building,
  Hash,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import API_CONFIG from "@/lib/api";

interface WeaviateObject {
  id: string;
  class: string;
  properties: Record<string, any>;
  creationTimeUnix?: number;
  lastUpdateTimeUnix?: number;
  vector?: number[];
  additional?: {
    id?: string;
    vector?: number[];
    creationTimeUnix?: number;
    lastUpdateTimeUnix?: number;
  };
}

interface ClassSchema {
  class: string;
  properties: Array<{
    name: string;
    dataType: string | string[];
    description?: string;
  }>;
}

interface ObjectsResponse {
  objects: WeaviateObject[];
  totalResults?: number;
}

export default function Objects() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [objects, setObjects] = useState<WeaviateObject[]>([]);
  const [schemas, setSchemas] = useState<ClassSchema[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [selectedObject, setSelectedObject] = useState<WeaviateObject | null>(
    null,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // Create object form
  const [newObjectClass, setNewObjectClass] = useState("");
  const [newObjectProperties, setNewObjectProperties] = useState<
    Record<string, any>
  >({});

  // Fetch objects from Weaviate
  const fetchObjects = async (page = 1, classFilter = selectedClass) => {
    try {
      const offset = (page - 1) * pageSize;
      let url = `/objects?limit=${pageSize}&offset=${offset}`;

      if (classFilter && classFilter !== "all") {
        // In Weaviate, we need to use GraphQL or specific endpoints for class filtering
        // For now, we'll fetch all and filter client-side in the fallback
      }

      const response: ObjectsResponse = await API_CONFIG.get(url);
      const fetchedObjects = response.objects || [];

      // Filter by class if specified
      const filteredObjects =
        classFilter && classFilter !== "all"
          ? fetchedObjects.filter(
              (obj) => obj.class.toLowerCase() === classFilter.toLowerCase(),
            )
          : fetchedObjects;

      setObjects(filteredObjects);
      setTotalResults(response.totalResults || filteredObjects.length);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch objects";
      console.error("Objects fetch error:", errorMessage);

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. Showing demo data.",
        );
        // Fallback demo data
        const demoObjects: WeaviateObject[] = [
          {
            id: "demo-1",
            class: "Article",
            properties: {
              title: "Introduction to Vector Databases (Demo)",
              content: "Vector databases are becoming essential for AI...",
              author: "John Doe",
              publishedAt: "2024-01-15T10:00:00Z",
            },
            creationTimeUnix: Date.now() - 86400000,
          },
          {
            id: "demo-2",
            class: "Product",
            properties: {
              name: "Smart Headphones (Demo)",
              description: "High-quality wireless headphones with AI features",
              price: 299.99,
              inStock: true,
            },
            creationTimeUnix: Date.now() - 43200000,
          },
          {
            id: "demo-3",
            class: "Article",
            properties: {
              title: "Machine Learning Best Practices (Demo)",
              content: "Essential guidelines for ML development...",
              author: "Jane Smith",
              publishedAt: "2024-01-14T15:30:00Z",
            },
            creationTimeUnix: Date.now() - 129600000,
          },
        ];

        // Filter demo data if class is selected
        const filteredDemo =
          classFilter && classFilter !== "all"
            ? demoObjects.filter(
                (obj) => obj.class.toLowerCase() === classFilter.toLowerCase(),
              )
            : demoObjects;

        setObjects(filteredDemo);
        setTotalResults(filteredDemo.length);

        toast({
          title: "Development Mode",
          description: "CORS prevents live connection. Showing demo objects.",
          variant: "default",
        });
      } else {
        setError(errorMessage);
        setObjects([]);
        setTotalResults(0);
        toast({
          title: "Objects Error",
          description: `Could not fetch objects: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

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
            { name: "publishedAt", dataType: ["date"] },
          ],
        },
        {
          class: "Product",
          properties: [
            { name: "name", dataType: ["text"] },
            { name: "description", dataType: ["text"] },
            { name: "price", dataType: ["number"] },
            { name: "inStock", dataType: ["boolean"] },
          ],
        },
      ]);
    }
  };

  // Create new object
  const handleCreateObject = async () => {
    if (!newObjectClass) {
      toast({
        title: "Validation Error",
        description: "Please select a class for the object",
        variant: "destructive",
      });
      return;
    }

    try {
      const newObject = {
        class: newObjectClass,
        properties: newObjectProperties,
      };

      await API_CONFIG.post("/objects", newObject);
      await fetchObjects(currentPage, selectedClass);

      setNewObjectClass("");
      setNewObjectProperties({});
      setShowCreateDialog(false);

      toast({
        title: "Object Created",
        description: "Object has been created successfully.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create object";

      if (errorMessage.includes("CORS")) {
        // Demo mode - add to local state
        const demoObject: WeaviateObject = {
          id: `demo-${Date.now()}`,
          class: newObjectClass,
          properties: { ...newObjectProperties, "(Demo)": "Not saved" },
          creationTimeUnix: Date.now(),
        };

        setObjects([demoObject, ...objects]);
        setNewObjectClass("");
        setNewObjectProperties({});
        setShowCreateDialog(false);

        toast({
          title: "Demo Mode",
          description:
            "Object added locally (not saved to Weaviate due to CORS).",
        });
      } else {
        toast({
          title: "Creation Error",
          description: `Could not create object: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Delete object
  const handleDeleteObject = async (objectId: string) => {
    try {
      await API_CONFIG.delete(`/objects/${objectId}`);
      await fetchObjects(currentPage, selectedClass);
      setShowDeleteDialog(null);

      toast({
        title: "Object Deleted",
        description: "Object has been deleted successfully.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete object";

      if (errorMessage.includes("CORS")) {
        // Demo mode - remove from local state
        setObjects(objects.filter((obj) => obj.id !== objectId));
        setShowDeleteDialog(null);

        toast({
          title: "Demo Mode",
          description:
            "Object removed locally (not deleted from Weaviate due to CORS).",
        });
      } else {
        toast({
          title: "Deletion Error",
          description: `Could not delete object: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Handle class filter change
  const handleClassFilterChange = (value: string) => {
    setSelectedClass(value);
    setCurrentPage(1);
    fetchObjects(1, value);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchObjects(currentPage, selectedClass);
    setRefreshing(false);

    toast({
      title: "Objects Refreshed",
      description: "Object data has been updated from Weaviate.",
    });
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSchema(), fetchObjects()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter objects by search term
  const filteredObjects = objects.filter((obj) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      obj.id.toLowerCase().includes(searchLower) ||
      obj.class.toLowerCase().includes(searchLower) ||
      Object.values(obj.properties).some((value) =>
        String(value).toLowerCase().includes(searchLower),
      )
    );
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleString();
  };

  const formatPropertyValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getClassColor = (className: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    return colors[className.length % colors.length];
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Loading Objects</h2>
                <p className="text-muted-foreground">
                  Fetching objects from Weaviate instance...
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
              Object Management
            </h1>
            <p className="text-muted-foreground">
              Browse and manage objects in your Weaviate database
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
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Object
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Object</DialogTitle>
                  <DialogDescription>
                    Add a new object to your Weaviate database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      value={newObjectClass}
                      onValueChange={setNewObjectClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
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

                  {newObjectClass && (
                    <div className="space-y-3">
                      <Label>Properties</Label>
                      {schemas
                        .find((s) => s.class === newObjectClass)
                        ?.properties.map((prop) => (
                          <div key={prop.name} className="space-y-1">
                            <Label className="text-sm">{prop.name}</Label>
                            <Input
                              placeholder={`Enter ${prop.name}...`}
                              value={newObjectProperties[prop.name] || ""}
                              onChange={(e) =>
                                setNewObjectProperties({
                                  ...newObjectProperties,
                                  [prop.name]: e.target.value,
                                })
                              }
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateObject}>Create Object</Button>
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

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search objects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedClass}
              onValueChange={handleClassFilterChange}
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {schemas.map((schema) => (
                  <SelectItem key={schema.class} value={schema.class}>
                    {schema.class}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredObjects.length} of {totalResults} objects
          </div>
        </div>

        {/* Objects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Objects
            </CardTitle>
            <CardDescription>
              All objects stored in your Weaviate database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredObjects.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Objects Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No objects match your search."
                    : selectedClass !== "all"
                      ? `No objects found in the ${selectedClass} class.`
                      : "No objects in your database."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Object
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObjects.map((obj) => (
                    <TableRow key={obj.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span>{obj.id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getClassColor(obj.class)}
                        >
                          {obj.class}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="space-y-1">
                          {Object.entries(obj.properties)
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
                          {Object.keys(obj.properties).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{Object.keys(obj.properties).length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(obj.creationTimeUnix)}</span>
                        </div>
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
                              onClick={() => setSelectedObject(obj)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Object
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  JSON.stringify(obj, null, 2),
                                );
                                toast({
                                  title: "Copied",
                                  description:
                                    "Object data copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy JSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setShowDeleteDialog(obj.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Object
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

        {/* Object Details Dialog */}
        {selectedObject && (
          <Dialog
            open={!!selectedObject}
            onOpenChange={() => setSelectedObject(null)}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Object Details</DialogTitle>
                <DialogDescription>
                  ID: {selectedObject.id} • Class: {selectedObject.class}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Created</Label>
                    <p className="text-muted-foreground">
                      {formatDate(selectedObject.creationTimeUnix)}
                    </p>
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-muted-foreground">
                      {formatDate(selectedObject.lastUpdateTimeUnix)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Properties</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(selectedObject.properties, null, 2)}
                    </pre>
                  </div>
                </div>

                {selectedObject.vector && (
                  <div>
                    <Label>
                      Vector ({selectedObject.vector.length} dimensions)
                    </Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <div className="text-sm font-mono text-muted-foreground">
                        [{selectedObject.vector.slice(0, 5).join(", ")}
                        {selectedObject.vector.length > 5 ? ", ..." : ""}]
                      </div>
                    </div>
                  </div>
                )}
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
              <AlertDialogTitle>Delete Object</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this object? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  showDeleteDialog && handleDeleteObject(showDeleteDialog)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Object
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
