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
} from "lucide-react";
import { useState } from "react";

interface Property {
  name: string;
  dataType: string;
  description?: string;
  tokenization?: string;
  vectorizer?: string;
  indexInverted?: boolean;
  indexSearchable?: boolean;
}

interface WeaviateClass {
  className: string;
  description?: string;
  properties: Property[];
  vectorizer: string;
  vectorIndexType: string;
  objectCount: number;
  createdAt: string;
}

export default function Schema() {
  const { toast } = useToast();

  const [classes, setClasses] = useState<WeaviateClass[]>([
    {
      className: "Article",
      description: "News articles and blog posts",
      vectorizer: "text2vec-openai",
      vectorIndexType: "hnsw",
      objectCount: 15420,
      createdAt: "2024-01-15",
      properties: [
        {
          name: "title",
          dataType: "text",
          description: "Article title",
          tokenization: "word",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "content",
          dataType: "text",
          description: "Article content",
          tokenization: "word",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "author",
          dataType: "text",
          description: "Article author",
          tokenization: "field",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "publishedDate",
          dataType: "date",
          description: "Publication date",
          indexInverted: true,
          indexSearchable: false,
        },
        {
          name: "category",
          dataType: "text",
          description: "Article category",
          tokenization: "field",
          indexInverted: true,
          indexSearchable: true,
        },
      ],
    },
    {
      className: "Person",
      description: "People and authors",
      vectorizer: "text2vec-openai",
      vectorIndexType: "hnsw",
      objectCount: 2543,
      createdAt: "2024-01-10",
      properties: [
        {
          name: "name",
          dataType: "text",
          description: "Person's full name",
          tokenization: "word",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "bio",
          dataType: "text",
          description: "Biography",
          tokenization: "word",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "email",
          dataType: "text",
          description: "Email address",
          tokenization: "field",
          indexInverted: true,
          indexSearchable: false,
        },
        {
          name: "birthDate",
          dataType: "date",
          description: "Date of birth",
          indexInverted: true,
          indexSearchable: false,
        },
      ],
    },
    {
      className: "Company",
      description: "Companies and organizations",
      vectorizer: "text2vec-cohere",
      vectorIndexType: "hnsw",
      objectCount: 891,
      createdAt: "2024-01-12",
      properties: [
        {
          name: "name",
          dataType: "text",
          description: "Company name",
          tokenization: "field",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "description",
          dataType: "text",
          description: "Company description",
          tokenization: "word",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "industry",
          dataType: "text",
          description: "Industry sector",
          tokenization: "field",
          indexInverted: true,
          indexSearchable: true,
        },
        {
          name: "foundedYear",
          dataType: "int",
          description: "Year founded",
          indexInverted: true,
          indexSearchable: false,
        },
      ],
    },
  ]);

  const [selectedClass, setSelectedClass] = useState<WeaviateClass | null>(
    null,
  );
  const [editingClass, setEditingClass] = useState<WeaviateClass | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClass, setShowAddClass] = useState(false);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [showDeleteClass, setShowDeleteClass] = useState(false);
  const [showDeleteProperty, setShowDeleteProperty] = useState(false);
  const [showExportSchema, setShowExportSchema] = useState(false);
  const [showImportSchema, setShowImportSchema] = useState(false);

  // Form states
  const [classForm, setClassForm] = useState({
    className: "",
    description: "",
    vectorizer: "",
    vectorIndexType: "hnsw",
  });

  const [propertyForm, setPropertyForm] = useState<Property>({
    name: "",
    dataType: "",
    description: "",
    tokenization: "",
    indexInverted: true,
    indexSearchable: false,
  });

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reset form function
  const resetClassForm = () => {
    setClassForm({
      className: "",
      description: "",
      vectorizer: "",
      vectorIndexType: "hnsw",
    });
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      name: "",
      dataType: "",
      description: "",
      tokenization: "",
      indexInverted: true,
      indexSearchable: false,
    });
  };

  // Create new class
  const handleCreateClass = () => {
    if (!classForm.className || !classForm.vectorizer) {
      toast({
        title: "Validation Error",
        description: "Class name and vectorizer are required",
        variant: "destructive",
      });
      return;
    }

    // Check if class already exists
    if (classes.some((cls) => cls.className === classForm.className)) {
      toast({
        title: "Error",
        description: "A class with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const newClass: WeaviateClass = {
      className: classForm.className,
      description: classForm.description,
      vectorizer: classForm.vectorizer,
      vectorIndexType: classForm.vectorIndexType,
      properties: [],
      objectCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setClasses([...classes, newClass]);
    resetClassForm();
    setShowAddClass(false);

    toast({
      title: "Success",
      description: `Class "${newClass.className}" created successfully`,
    });
  };

  // Edit class
  const handleEditClass = () => {
    if (!editingClass || !classForm.className || !classForm.vectorizer) {
      toast({
        title: "Validation Error",
        description: "Class name and vectorizer are required",
        variant: "destructive",
      });
      return;
    }

    const updatedClasses = classes.map((cls) =>
      cls.className === editingClass.className
        ? {
            ...cls,
            className: classForm.className,
            description: classForm.description,
            vectorizer: classForm.vectorizer,
            vectorIndexType: classForm.vectorIndexType,
          }
        : cls,
    );

    setClasses(updatedClasses);
    setEditingClass(null);
    resetClassForm();
    setShowEditClass(false);

    toast({
      title: "Success",
      description: `Class "${classForm.className}" updated successfully`,
    });
  };

  // Delete class
  const handleDeleteClass = () => {
    if (!classToDelete) return;

    setClasses(classes.filter((cls) => cls.className !== classToDelete));
    setClassToDelete(null);
    setShowDeleteClass(false);

    toast({
      title: "Success",
      description: `Class "${classToDelete}" deleted successfully`,
    });
  };

  // Add property
  const handleAddProperty = () => {
    if (!selectedClass || !propertyForm.name || !propertyForm.dataType) {
      toast({
        title: "Validation Error",
        description: "Property name and data type are required",
        variant: "destructive",
      });
      return;
    }

    // Check if property already exists
    if (
      selectedClass.properties.some((prop) => prop.name === propertyForm.name)
    ) {
      toast({
        title: "Error",
        description: "A property with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedClasses = classes.map((cls) =>
      cls.className === selectedClass.className
        ? {
            ...cls,
            properties: [...cls.properties, { ...propertyForm }],
          }
        : cls,
    );

    const updatedSelectedClass = updatedClasses.find(
      (cls) => cls.className === selectedClass.className,
    );

    setClasses(updatedClasses);
    setSelectedClass(updatedSelectedClass || null);
    resetPropertyForm();
    setShowAddProperty(false);

    toast({
      title: "Success",
      description: `Property "${propertyForm.name}" added successfully`,
    });
  };

  // Edit property
  const handleEditProperty = () => {
    if (
      !selectedClass ||
      !editingProperty ||
      !propertyForm.name ||
      !propertyForm.dataType
    ) {
      toast({
        title: "Validation Error",
        description: "Property name and data type are required",
        variant: "destructive",
      });
      return;
    }

    const updatedClasses = classes.map((cls) =>
      cls.className === selectedClass.className
        ? {
            ...cls,
            properties: cls.properties.map((prop) =>
              prop.name === editingProperty.name ? { ...propertyForm } : prop,
            ),
          }
        : cls,
    );

    const updatedSelectedClass = updatedClasses.find(
      (cls) => cls.className === selectedClass.className,
    );

    setClasses(updatedClasses);
    setSelectedClass(updatedSelectedClass || null);
    setEditingProperty(null);
    resetPropertyForm();
    setShowEditProperty(false);

    toast({
      title: "Success",
      description: `Property "${propertyForm.name}" updated successfully`,
    });
  };

  // Delete property
  const handleDeleteProperty = () => {
    if (!selectedClass || !propertyToDelete) return;

    const updatedClasses = classes.map((cls) =>
      cls.className === selectedClass.className
        ? {
            ...cls,
            properties: cls.properties.filter(
              (prop) => prop.name !== propertyToDelete,
            ),
          }
        : cls,
    );

    const updatedSelectedClass = updatedClasses.find(
      (cls) => cls.className === selectedClass.className,
    );

    setClasses(updatedClasses);
    setSelectedClass(updatedSelectedClass || null);
    setPropertyToDelete(null);
    setShowDeleteProperty(false);

    toast({
      title: "Success",
      description: `Property "${propertyToDelete}" deleted successfully`,
    });
  };

  // Export schema
  const handleExportSchema = () => {
    const schemaData = {
      classes: classes,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(schemaData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weaviate-schema-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Schema exported successfully",
    });
  };

  // Copy class to clipboard
  const handleCopyClass = (cls: WeaviateClass) => {
    navigator.clipboard.writeText(JSON.stringify(cls, null, 2));
    toast({
      title: "Success",
      description: `Class "${cls.className}" copied to clipboard`,
    });
  };

  // Open edit dialogs
  const openEditClassDialog = (cls: WeaviateClass) => {
    setEditingClass(cls);
    setClassForm({
      className: cls.className,
      description: cls.description || "",
      vectorizer: cls.vectorizer,
      vectorIndexType: cls.vectorIndexType,
    });
    setShowEditClass(true);
  };

  const openEditPropertyDialog = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({ ...property });
    setShowEditProperty(true);
  };

  const getVectorizerBadgeColor = (vectorizer: string) => {
    switch (vectorizer) {
      case "text2vec-openai":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "text2vec-cohere":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "text2vec-huggingface":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDataTypeBadgeColor = (dataType: string) => {
    switch (dataType) {
      case "text":
        return "bg-green-100 text-green-800 border-green-200";
      case "int":
      case "number":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "date":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "boolean":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
              Schema Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage Weaviate classes, properties, and schema configuration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSchema}>
              <Download className="h-4 w-4 mr-2" />
              Export Schema
            </Button>
            <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Define a new class schema with properties and configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="className">
                        Class Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="className"
                        value={classForm.className}
                        onChange={(e) =>
                          setClassForm({
                            ...classForm,
                            className: e.target.value,
                          })
                        }
                        placeholder="e.g., Article"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vectorizer">
                        Vectorizer <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={classForm.vectorizer}
                        onValueChange={(value) =>
                          setClassForm({ ...classForm, vectorizer: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vectorizer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text2vec-openai">
                            text2vec-openai
                          </SelectItem>
                          <SelectItem value="text2vec-cohere">
                            text2vec-cohere
                          </SelectItem>
                          <SelectItem value="text2vec-huggingface">
                            text2vec-huggingface
                          </SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vectorIndexType">Vector Index Type</Label>
                    <Select
                      value={classForm.vectorIndexType}
                      onValueChange={(value) =>
                        setClassForm({ ...classForm, vectorIndexType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hnsw">HNSW</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={classForm.description}
                      onChange={(e) =>
                        setClassForm({
                          ...classForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this class..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddClass(false);
                        resetClassForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateClass}>Create Class</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Class List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema Classes ({filteredClasses.length})
            </CardTitle>
            <CardDescription>
              All classes defined in your Weaviate schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vectorizer</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Objects</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.className}>
                    <TableCell className="font-medium">
                      {cls.className}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cls.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getVectorizerBadgeColor(cls.vectorizer)}
                      >
                        {cls.vectorizer}
                      </Badge>
                    </TableCell>
                    <TableCell>{cls.properties.length}</TableCell>
                    <TableCell>{cls.objectCount.toLocaleString()}</TableCell>
                    <TableCell>{cls.createdAt}</TableCell>
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
                              setSelectedClass(cls);
                              setShowClassDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditClassDialog(cls)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopyClass(cls)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setClassToDelete(cls.className);
                              setShowDeleteClass(true);
                            }}
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

            {filteredClasses.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Create your first class to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Detail Dialog */}
        <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {selectedClass?.className}
              </DialogTitle>
              <DialogDescription>
                {selectedClass?.description || "No description available"}
              </DialogDescription>
            </DialogHeader>

            {selectedClass && (
              <div className="space-y-6">
                {/* Class Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Vectorizer</Label>
                    <Badge
                      className={getVectorizerBadgeColor(
                        selectedClass.vectorizer,
                      )}
                    >
                      {selectedClass.vectorizer}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vector Index</Label>
                    <p className="text-sm">{selectedClass.vectorIndexType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Object Count</Label>
                    <p className="text-sm font-bold">
                      {selectedClass.objectCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm">{selectedClass.createdAt}</p>
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Properties</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetPropertyForm();
                        setShowAddProperty(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property Name</TableHead>
                            <TableHead>Data Type</TableHead>
                            <TableHead>Tokenization</TableHead>
                            <TableHead>Indexed</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedClass.properties.map((property) => (
                            <TableRow key={property.name}>
                              <TableCell className="font-medium">
                                {property.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getDataTypeBadgeColor(
                                    property.dataType,
                                  )}
                                >
                                  {property.dataType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {property.tokenization || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {property.indexInverted && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Inverted
                                    </Badge>
                                  )}
                                  {property.indexSearchable && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Searchable
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {property.description || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openEditPropertyDialog(property)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setPropertyToDelete(property.name);
                                      setShowDeleteProperty(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {selectedClass.properties.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No properties defined
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Add properties to define the structure of this class
                          </p>
                          <Button
                            onClick={() => {
                              resetPropertyForm();
                              setShowAddProperty(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Property
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowClassDetail(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => openEditClassDialog(selectedClass)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Class
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={showEditClass} onOpenChange={setShowEditClass}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update the class configuration and properties
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editClassName">
                    Class Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editClassName"
                    value={classForm.className}
                    onChange={(e) =>
                      setClassForm({ ...classForm, className: e.target.value })
                    }
                    placeholder="e.g., Article"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editVectorizer">
                    Vectorizer <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={classForm.vectorizer}
                    onValueChange={(value) =>
                      setClassForm({ ...classForm, vectorizer: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vectorizer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text2vec-openai">
                        text2vec-openai
                      </SelectItem>
                      <SelectItem value="text2vec-cohere">
                        text2vec-cohere
                      </SelectItem>
                      <SelectItem value="text2vec-huggingface">
                        text2vec-huggingface
                      </SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVectorIndexType">Vector Index Type</Label>
                <Select
                  value={classForm.vectorIndexType}
                  onValueChange={(value) =>
                    setClassForm({ ...classForm, vectorIndexType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hnsw">HNSW</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={classForm.description}
                  onChange={(e) =>
                    setClassForm({ ...classForm, description: e.target.value })
                  }
                  placeholder="Describe this class..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditClass(false);
                    setEditingClass(null);
                    resetClassForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClass}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Property Dialog */}
        <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Property</DialogTitle>
              <DialogDescription>
                Define a new property for the {selectedClass?.className} class
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">
                    Property Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="propertyName"
                    value={propertyForm.name}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, name: e.target.value })
                    }
                    placeholder="e.g., title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyDataType">
                    Data Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={propertyForm.dataType}
                    onValueChange={(value) =>
                      setPropertyForm({ ...propertyForm, dataType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="uuid">UUID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {propertyForm.dataType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="propertyTokenization">Tokenization</Label>
                  <Select
                    value={propertyForm.tokenization}
                    onValueChange={(value) =>
                      setPropertyForm({ ...propertyForm, tokenization: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tokenization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="field">Field</SelectItem>
                      <SelectItem value="whitespace">Whitespace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="propertyDescription">Description</Label>
                <Textarea
                  id="propertyDescription"
                  value={propertyForm.description}
                  onChange={(e) =>
                    setPropertyForm({
                      ...propertyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this property..."
                />
              </div>

              <div className="space-y-3">
                <Label>Indexing Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="indexInverted"
                      checked={propertyForm.indexInverted}
                      onCheckedChange={(checked) =>
                        setPropertyForm({
                          ...propertyForm,
                          indexInverted: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="indexInverted" className="text-sm">
                      Enable inverted index (for filtering)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="indexSearchable"
                      checked={propertyForm.indexSearchable}
                      onCheckedChange={(checked) =>
                        setPropertyForm({
                          ...propertyForm,
                          indexSearchable: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="indexSearchable" className="text-sm">
                      Enable searchable index (for BM25 search)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddProperty(false);
                    resetPropertyForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProperty}>Add Property</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Property Dialog */}
        <Dialog open={showEditProperty} onOpenChange={setShowEditProperty}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
              <DialogDescription>
                Update the property configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPropertyName">
                    Property Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editPropertyName"
                    value={propertyForm.name}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, name: e.target.value })
                    }
                    placeholder="e.g., title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPropertyDataType">
                    Data Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={propertyForm.dataType}
                    onValueChange={(value) =>
                      setPropertyForm({ ...propertyForm, dataType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="uuid">UUID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {propertyForm.dataType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="editPropertyTokenization">Tokenization</Label>
                  <Select
                    value={propertyForm.tokenization}
                    onValueChange={(value) =>
                      setPropertyForm({ ...propertyForm, tokenization: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tokenization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="field">Field</SelectItem>
                      <SelectItem value="whitespace">Whitespace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editPropertyDescription">Description</Label>
                <Textarea
                  id="editPropertyDescription"
                  value={propertyForm.description}
                  onChange={(e) =>
                    setPropertyForm({
                      ...propertyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this property..."
                />
              </div>

              <div className="space-y-3">
                <Label>Indexing Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editIndexInverted"
                      checked={propertyForm.indexInverted}
                      onCheckedChange={(checked) =>
                        setPropertyForm({
                          ...propertyForm,
                          indexInverted: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="editIndexInverted" className="text-sm">
                      Enable inverted index (for filtering)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editIndexSearchable"
                      checked={propertyForm.indexSearchable}
                      onCheckedChange={(checked) =>
                        setPropertyForm({
                          ...propertyForm,
                          indexSearchable: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="editIndexSearchable" className="text-sm">
                      Enable searchable index (for BM25 search)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditProperty(false);
                    setEditingProperty(null);
                    resetPropertyForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditProperty}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Class Confirmation */}
        <AlertDialog open={showDeleteClass} onOpenChange={setShowDeleteClass}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the class "{classToDelete}"?
                This will also delete all{" "}
                {classes
                  .find((c) => c.className === classToDelete)
                  ?.objectCount.toLocaleString() || 0}{" "}
                objects in this class. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClassToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClass}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Class
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Property Confirmation */}
        <AlertDialog
          open={showDeleteProperty}
          onOpenChange={setShowDeleteProperty}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Property</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the property "{propertyToDelete}
                "? This will remove the property from all existing objects in
                this class. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPropertyToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProperty}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Property
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
