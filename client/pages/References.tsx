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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Link as LinkIcon,
  Plus,
  Search,
  Trash2,
  Eye,
  ArrowRight,
  ArrowLeft,
  Network,
  FileText,
  User,
  Building,
  MoreHorizontal,
  ExternalLink,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

interface WeaviateObject {
  id: string;
  className: string;
  properties: Record<string, any>;
  createdAt: string;
}

interface Reference {
  id: string;
  fromObject: WeaviateObject;
  toObject: WeaviateObject;
  propertyName: string;
  direction: "outgoing" | "incoming";
  createdAt: string;
  beacon: string;
}

interface ReferenceProperty {
  name: string;
  dataType: string;
  targetClass: string;
  description?: string;
}

interface ClassSchema {
  className: string;
  referenceProperties: ReferenceProperty[];
}

export default function References() {
  const { toast } = useToast();

  // Mock data for demonstration
  const [objects] = useState<WeaviateObject[]>([
    {
      id: "00000000-0000-0000-0000-000000000001",
      className: "Article",
      properties: {
        title: "Introduction to Vector Databases",
        content: "Vector databases are becoming increasingly important...",
      },
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      className: "Person",
      properties: {
        name: "John Smith",
        bio: "Technology writer and AI enthusiast...",
      },
      createdAt: "2024-01-08T12:00:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      className: "Company",
      properties: {
        name: "TechCorp Inc.",
        description: "Leading technology company...",
      },
      createdAt: "2024-01-05T16:45:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000005",
      className: "Person",
      properties: {
        name: "Jane Doe",
        bio: "Machine learning researcher...",
      },
      createdAt: "2024-01-03T09:30:00Z",
    },
  ]);

  const [schemas] = useState<ClassSchema[]>([
    {
      className: "Article",
      referenceProperties: [
        {
          name: "author",
          dataType: "reference",
          targetClass: "Person",
          description: "The author of the article",
        },
        {
          name: "publisher",
          dataType: "reference",
          targetClass: "Company",
          description: "The publishing company",
        },
      ],
    },
    {
      className: "Person",
      referenceProperties: [
        {
          name: "employer",
          dataType: "reference",
          targetClass: "Company",
          description: "Current employer",
        },
        {
          name: "articles",
          dataType: "reference",
          targetClass: "Article",
          description: "Written articles",
        },
      ],
    },
    {
      className: "Company",
      referenceProperties: [
        {
          name: "employees",
          dataType: "reference",
          targetClass: "Person",
          description: "Company employees",
        },
        {
          name: "publications",
          dataType: "reference",
          targetClass: "Article",
          description: "Published articles",
        },
      ],
    },
  ]);

  const [references, setReferences] = useState<Reference[]>([
    {
      id: "ref-001",
      fromObject: objects[0], // Article
      toObject: objects[1], // John Smith
      propertyName: "author",
      direction: "outgoing",
      createdAt: "2024-01-15T10:30:00Z",
      beacon:
        "weaviate://localhost/Person/00000000-0000-0000-0000-000000000003",
    },
    {
      id: "ref-002",
      fromObject: objects[0], // Article
      toObject: objects[2], // TechCorp
      propertyName: "publisher",
      direction: "outgoing",
      createdAt: "2024-01-15T10:30:00Z",
      beacon:
        "weaviate://localhost/Company/00000000-0000-0000-0000-000000000004",
    },
    {
      id: "ref-003",
      fromObject: objects[1], // John Smith
      toObject: objects[2], // TechCorp
      propertyName: "employer",
      direction: "outgoing",
      createdAt: "2024-01-08T12:00:00Z",
      beacon:
        "weaviate://localhost/Company/00000000-0000-0000-0000-000000000004",
    },
    {
      id: "ref-004",
      fromObject: objects[3], // Jane Doe
      toObject: objects[2], // TechCorp
      propertyName: "employer",
      direction: "outgoing",
      createdAt: "2024-01-03T09:30:00Z",
      beacon:
        "weaviate://localhost/Company/00000000-0000-0000-0000-000000000004",
    },
  ]);

  const [selectedObject, setSelectedObject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddReference, setShowAddReference] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<string | null>(
    null,
  );

  // Form state for adding references
  const [referenceForm, setReferenceForm] = useState({
    fromObjectId: "",
    propertyName: "",
    toObjectId: "",
  });

  // Filter references based on selected filters and search
  const filteredReferences = references.filter((ref) => {
    const matchesObject =
      selectedObject === "all" ||
      ref.fromObject.id === selectedObject ||
      ref.toObject.id === selectedObject;

    const matchesClass =
      selectedClass === "all" ||
      ref.fromObject.className === selectedClass ||
      ref.toObject.className === selectedClass;

    const matchesSearch =
      searchTerm === "" ||
      ref.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.fromObject.properties.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ref.fromObject.properties.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ref.toObject.properties.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ref.toObject.properties.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesObject && matchesClass && matchesSearch;
  });

  // Get available reference properties for selected from object
  const getAvailableProperties = (fromObjectId: string) => {
    const fromObject = objects.find((obj) => obj.id === fromObjectId);
    if (!fromObject) return [];

    const schema = schemas.find((s) => s.className === fromObject.className);
    return schema?.referenceProperties || [];
  };

  // Get available target objects for selected property
  const getAvailableTargets = (fromObjectId: string, propertyName: string) => {
    const fromObject = objects.find((obj) => obj.id === fromObjectId);
    if (!fromObject) return [];

    const schema = schemas.find((s) => s.className === fromObject.className);
    const property = schema?.referenceProperties.find(
      (p) => p.name === propertyName,
    );
    if (!property) return [];

    return objects.filter(
      (obj) =>
        obj.className === property.targetClass && obj.id !== fromObjectId,
    );
  };

  // Handle adding a new reference
  const handleAddReference = () => {
    if (
      !referenceForm.fromObjectId ||
      !referenceForm.propertyName ||
      !referenceForm.toObjectId
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if reference already exists
    const existingRef = references.find(
      (ref) =>
        ref.fromObject.id === referenceForm.fromObjectId &&
        ref.propertyName === referenceForm.propertyName &&
        ref.toObject.id === referenceForm.toObjectId,
    );

    if (existingRef) {
      toast({
        title: "Reference Exists",
        description: "This reference already exists",
        variant: "destructive",
      });
      return;
    }

    const fromObject = objects.find(
      (obj) => obj.id === referenceForm.fromObjectId,
    )!;
    const toObject = objects.find(
      (obj) => obj.id === referenceForm.toObjectId,
    )!;

    const newReference: Reference = {
      id: `ref-${Date.now()}`,
      fromObject,
      toObject,
      propertyName: referenceForm.propertyName,
      direction: "outgoing",
      createdAt: new Date().toISOString(),
      beacon: `weaviate://localhost/${toObject.className}/${toObject.id}`,
    };

    setReferences([...references, newReference]);
    setReferenceForm({ fromObjectId: "", propertyName: "", toObjectId: "" });
    setShowAddReference(false);

    toast({
      title: "Success",
      description: "Reference created successfully",
    });
  };

  // Handle deleting a reference
  const handleDeleteReference = () => {
    if (!referenceToDelete) return;

    setReferences(references.filter((ref) => ref.id !== referenceToDelete));
    setReferenceToDelete(null);
    setShowDeleteConfirm(false);

    toast({
      title: "Success",
      description: "Reference deleted successfully",
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
        return <LinkIcon className="h-4 w-4" />;
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

  // Get display text for object
  const getObjectDisplayText = (obj: WeaviateObject) => {
    return (
      obj.properties.name ||
      obj.properties.title ||
      `${obj.className} ${obj.id.substring(0, 8)}`
    );
  };

  // Reset form
  const resetForm = () => {
    setReferenceForm({ fromObjectId: "", propertyName: "", toObjectId: "" });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Reference Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage object references and relationships in your Weaviate
              instance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showAddReference} onOpenChange={setShowAddReference}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reference
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Reference</DialogTitle>
                  <DialogDescription>
                    Create a relationship between two objects
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromObject">
                      From Object <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={referenceForm.fromObjectId}
                      onValueChange={(value) => {
                        setReferenceForm({
                          fromObjectId: value,
                          propertyName: "",
                          toObjectId: "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source object" />
                      </SelectTrigger>
                      <SelectContent>
                        {objects.map((obj) => (
                          <SelectItem key={obj.id} value={obj.id}>
                            <div className="flex items-center gap-2">
                              {getClassIcon(obj.className)}
                              <span className="font-medium">
                                {getObjectDisplayText(obj)}
                              </span>
                              <Badge className={getClassColor(obj.className)}>
                                {obj.className}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {referenceForm.fromObjectId && (
                    <div className="space-y-2">
                      <Label htmlFor="propertyName">
                        Reference Property{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={referenceForm.propertyName}
                        onValueChange={(value) =>
                          setReferenceForm({
                            ...referenceForm,
                            propertyName: value,
                            toObjectId: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reference property" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableProperties(
                            referenceForm.fromObjectId,
                          ).map((prop) => (
                            <SelectItem key={prop.name} value={prop.name}>
                              <div className="space-y-1">
                                <div className="font-medium">{prop.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  → {prop.targetClass}{" "}
                                  {prop.description && `(${prop.description})`}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {referenceForm.propertyName && (
                    <div className="space-y-2">
                      <Label htmlFor="toObject">
                        To Object <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={referenceForm.toObjectId}
                        onValueChange={(value) =>
                          setReferenceForm({
                            ...referenceForm,
                            toObjectId: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target object" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTargets(
                            referenceForm.fromObjectId,
                            referenceForm.propertyName,
                          ).map((obj) => (
                            <SelectItem key={obj.id} value={obj.id}>
                              <div className="flex items-center gap-2">
                                {getClassIcon(obj.className)}
                                <span className="font-medium">
                                  {getObjectDisplayText(obj)}
                                </span>
                                <Badge className={getClassColor(obj.className)}>
                                  {obj.className}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddReference(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddReference}
                      disabled={
                        !referenceForm.fromObjectId ||
                        !referenceForm.propertyName ||
                        !referenceForm.toObjectId
                      }
                    >
                      Create Reference
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total References
                  </p>
                  <p className="text-2xl font-bold">{references.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Connected Objects
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      new Set([
                        ...references.map((r) => r.fromObject.id),
                        ...references.map((r) => r.toObject.id),
                      ]).size
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Article References
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      references.filter(
                        (r) =>
                          r.fromObject.className === "Article" ||
                          r.toObject.className === "Article",
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Person References
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      references.filter(
                        (r) =>
                          r.fromObject.className === "Person" ||
                          r.toObject.className === "Person",
                      ).length
                    }
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
              placeholder="Search references..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="Person">Person</SelectItem>
              <SelectItem value="Company">Company</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedObject} onValueChange={setSelectedObject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by object" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Objects</SelectItem>
              {objects.map((obj) => (
                <SelectItem key={obj.id} value={obj.id}>
                  {getObjectDisplayText(obj)} ({obj.className})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* References Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Object References ({filteredReferences.length})
            </CardTitle>
            <CardDescription>
              All references and relationships between objects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From Object</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>To Object</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferences.map((reference) => (
                  <TableRow key={reference.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={getClassColor(
                            reference.fromObject.className,
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {getClassIcon(reference.fromObject.className)}
                            {reference.fromObject.className}
                          </span>
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {getObjectDisplayText(reference.fromObject)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reference.fromObject.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {reference.propertyName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={getClassColor(
                            reference.toObject.className,
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {getClassIcon(reference.toObject.className)}
                            {reference.toObject.className}
                          </span>
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {getObjectDisplayText(reference.toObject)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reference.toObject.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reference.direction === "outgoing"
                          ? "Outgoing"
                          : "Incoming"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reference.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View From Object
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View To Object
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setReferenceToDelete(reference.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Reference
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredReferences.length === 0 && (
              <div className="text-center py-12">
                <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No references found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ||
                  selectedObject !== "all" ||
                  selectedClass !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first reference to connect objects"}
                </p>
                {!searchTerm &&
                  selectedObject === "all" &&
                  selectedClass === "all" && (
                    <Button onClick={() => setShowAddReference(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Reference
                    </Button>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reference Schema Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Reference Schema
            </CardTitle>
            <CardDescription>
              Available reference properties for each class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schemas.map((schema) => (
                <div key={schema.className} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getClassColor(schema.className)}>
                      <span className="flex items-center gap-1">
                        {getClassIcon(schema.className)}
                        {schema.className}
                      </span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {schema.referenceProperties.map((prop) => (
                      <div key={prop.name} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {prop.name}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {prop.targetClass}
                          </Badge>
                        </div>
                        {prop.description && (
                          <p className="text-xs text-muted-foreground">
                            {prop.description}
                          </p>
                        )}
                      </div>
                    ))}
                    {schema.referenceProperties.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No reference properties defined
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Reference Confirmation */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reference</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this reference? This will break
                the relationship between the objects. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReferenceToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReference}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Reference
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
