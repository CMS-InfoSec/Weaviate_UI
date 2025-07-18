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
} from "lucide-react";
import { useState } from "react";

interface WeaviateObject {
  id: string;
  className: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  vector?: number[];
}

interface ClassSchema {
  className: string;
  properties: Array<{
    name: string;
    dataType: string;
    description?: string;
  }>;
}

export default function Objects() {
  const [objects, setObjects] = useState<WeaviateObject[]>([
    {
      id: "00000000-0000-0000-0000-000000000001",
      className: "Article",
      properties: {
        title: "Introduction to Vector Databases",
        content:
          "Vector databases are becoming increasingly important for AI applications...",
        author: "John Smith",
        publishedDate: "2024-01-15",
        category: "Technology",
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      className: "Article",
      properties: {
        title: "Machine Learning Best Practices",
        content:
          "Building effective machine learning models requires careful consideration...",
        author: "Jane Doe",
        publishedDate: "2024-01-10",
        category: "AI",
      },
      createdAt: "2024-01-10T14:20:00Z",
      updatedAt: "2024-01-12T09:15:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      className: "Person",
      properties: {
        name: "John Smith",
        bio: "Technology writer and AI enthusiast with 10 years of experience in the field.",
        email: "john.smith@example.com",
        birthDate: "1985-03-15",
      },
      createdAt: "2024-01-08T12:00:00Z",
      updatedAt: "2024-01-08T12:00:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      className: "Company",
      properties: {
        name: "TechCorp Inc.",
        description: "Leading technology company specializing in AI solutions.",
        industry: "Technology",
        foundedYear: 2015,
      },
      createdAt: "2024-01-05T16:45:00Z",
      updatedAt: "2024-01-05T16:45:00Z",
    },
    {
      id: "00000000-0000-0000-0000-000000000005",
      className: "Person",
      properties: {
        name: "Jane Doe",
        bio: "Machine learning researcher and data scientist.",
        email: "jane.doe@example.com",
        birthDate: "1990-07-22",
      },
      createdAt: "2024-01-03T09:30:00Z",
      updatedAt: "2024-01-03T09:30:00Z",
    },
  ]);

  const [classes] = useState<ClassSchema[]>([
    {
      className: "Article",
      properties: [
        { name: "title", dataType: "text", description: "Article title" },
        { name: "content", dataType: "text", description: "Article content" },
        { name: "author", dataType: "text", description: "Article author" },
        {
          name: "publishedDate",
          dataType: "date",
          description: "Publication date",
        },
        { name: "category", dataType: "text", description: "Article category" },
      ],
    },
    {
      className: "Person",
      properties: [
        { name: "name", dataType: "text", description: "Person's full name" },
        { name: "bio", dataType: "text", description: "Biography" },
        { name: "email", dataType: "text", description: "Email address" },
        { name: "birthDate", dataType: "date", description: "Date of birth" },
      ],
    },
    {
      className: "Company",
      properties: [
        { name: "name", dataType: "text", description: "Company name" },
        {
          name: "description",
          dataType: "text",
          description: "Company description",
        },
        { name: "industry", dataType: "text", description: "Industry sector" },
        { name: "foundedYear", dataType: "int", description: "Year founded" },
      ],
    },
  ]);

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedObject, setSelectedObject] = useState<WeaviateObject | null>(
    null,
  );
  const [showAddObject, setShowAddObject] = useState(false);
  const [showObjectDetail, setShowObjectDetail] = useState(false);
  const [showEditObject, setShowEditObject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formClass, setFormClass] = useState<string>("");

  const filteredObjects = objects.filter((obj) => {
    const matchesClass =
      selectedClass === "all" || obj.className === selectedClass;
    const matchesSearch =
      searchTerm === "" ||
      Object.values(obj.properties).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      obj.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const getClassIcon = (className: string) => {
    switch (className) {
      case "Article":
        return <FileText className="h-4 w-4" />;
      case "Person":
        return <User className="h-4 w-4" />;
      case "Company":
        return <Building className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

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

  const handleDeleteObject = (objectId: string) => {
    setObjects(objects.filter((obj) => obj.id !== objectId));
    setObjectToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleAddObject = () => {
    if (!formClass || Object.keys(formData).length === 0) return;

    const newObject: WeaviateObject = {
      id: `00000000-0000-0000-0000-${Date.now().toString().padStart(12, "0")}`,
      className: formClass,
      properties: { ...formData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setObjects([newObject, ...objects]);
    setFormData({});
    setFormClass("");
    setShowAddObject(false);
  };

  const handleEditObject = () => {
    if (!selectedObject) return;

    const updatedObjects = objects.map((obj) =>
      obj.id === selectedObject.id
        ? {
            ...obj,
            properties: { ...formData },
            updatedAt: new Date().toISOString(),
          }
        : obj,
    );

    setObjects(updatedObjects);
    setFormData({});
    setShowEditObject(false);
  };

  const openEditDialog = (object: WeaviateObject) => {
    setSelectedObject(object);
    setFormData(object.properties);
    setFormClass(object.className);
    setShowEditObject(true);
  };

  const renderFormFields = (classSchema: ClassSchema) => {
    return classSchema.properties.map((property) => (
      <div key={property.name} className="space-y-2">
        <Label htmlFor={property.name} className="text-sm font-medium">
          {property.name}
          {property.description && (
            <span className="text-xs text-muted-foreground ml-1">
              ({property.description})
            </span>
          )}
        </Label>
        {property.dataType === "text" && property.name === "content" ? (
          <Textarea
            id={property.name}
            value={formData[property.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [property.name]: e.target.value })
            }
            placeholder={`Enter ${property.name}...`}
            rows={4}
          />
        ) : property.dataType === "date" ? (
          <Input
            id={property.name}
            type="date"
            value={formData[property.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [property.name]: e.target.value })
            }
          />
        ) : property.dataType === "int" || property.dataType === "number" ? (
          <Input
            id={property.name}
            type="number"
            value={formData[property.name] || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                [property.name]: parseInt(e.target.value) || "",
              })
            }
            placeholder={`Enter ${property.name}...`}
          />
        ) : (
          <Input
            id={property.name}
            value={formData[property.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [property.name]: e.target.value })
            }
            placeholder={`Enter ${property.name}...`}
          />
        )}
      </div>
    ));
  };

  const formatPropertyValue = (value: any, dataType?: string) => {
    if (value === null || value === undefined) return "-";

    if (dataType === "date") {
      return new Date(value).toLocaleDateString();
    }

    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }

    return String(value);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Object Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse, create, edit, and delete Weaviate objects
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Import Objects</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or JSON file to import multiple objects
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="importClass">Target Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.className} value={cls.className}>
                            {cls.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importFile">File</Label>
                    <Input type="file" accept=".csv,.json" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkImport(false)}
                    >
                      Cancel
                    </Button>
                    <Button>Import</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddObject} onOpenChange={setShowAddObject}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Object
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Object</DialogTitle>
                  <DialogDescription>
                    Add a new object to your Weaviate instance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="objectClass">Class</Label>
                    <Select value={formClass} onValueChange={setFormClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.className} value={cls.className}>
                            {cls.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formClass && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Properties</h3>
                      {renderFormFields(
                        classes.find((c) => c.className === formClass)!,
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddObject(false);
                        setFormData({});
                        setFormClass("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddObject} disabled={!formClass}>
                      Create Object
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search objects..."
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
              {classes.map((cls) => (
                <SelectItem key={cls.className} value={cls.className}>
                  {cls.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Objects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Objects ({filteredObjects.length})
            </CardTitle>
            <CardDescription>
              All objects in your Weaviate instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObjects.map((object) => (
                  <TableRow key={object.id}>
                    <TableCell className="font-mono text-sm">
                      {object.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge className={getClassColor(object.className)}>
                        <span className="flex items-center gap-1">
                          {getClassIcon(object.className)}
                          {object.className}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="space-y-1">
                        {Object.entries(object.properties)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-muted-foreground">
                                {key}:
                              </span>{" "}
                              <span>{formatPropertyValue(value)}</span>
                            </div>
                          ))}
                        {Object.keys(object.properties).length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{Object.keys(object.properties).length - 2} more...
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(object.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(object.updatedAt).toLocaleDateString()}
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
                              setSelectedObject(object);
                              setShowObjectDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(object)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Object
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(object.id)
                            }
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setObjectToDelete(object.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredObjects.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No objects found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedClass !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first object to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Object Detail Dialog */}
        <Dialog open={showObjectDetail} onOpenChange={setShowObjectDetail}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedObject && getClassIcon(selectedObject.className)}
                Object Details
              </DialogTitle>
              <DialogDescription>
                {selectedObject &&
                  `${selectedObject.className} • ${selectedObject.id}`}
              </DialogDescription>
            </DialogHeader>

            {selectedObject && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Object ID</Label>
                    <p className="font-mono">{selectedObject.id}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Class</Label>
                    <p>{selectedObject.className}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Created</Label>
                    <p>{new Date(selectedObject.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Updated</Label>
                    <p>{new Date(selectedObject.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Properties</h3>
                  <div className="space-y-4">
                    {Object.entries(selectedObject.properties).map(
                      ([key, value]) => (
                        <div key={key} className="border rounded-lg p-3">
                          <Label className="font-medium">{key}</Label>
                          <p className="mt-1 text-sm">
                            {formatPropertyValue(value)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowObjectDetail(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowObjectDetail(false);
                      openEditDialog(selectedObject);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Object
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Object Dialog */}
        <Dialog open={showEditObject} onOpenChange={setShowEditObject}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Object</DialogTitle>
              <DialogDescription>
                Update the properties of this object
              </DialogDescription>
            </DialogHeader>

            {selectedObject && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded-lg">
                  <div>
                    <Label className="font-medium">Object ID</Label>
                    <p className="font-mono">{selectedObject.id}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Class</Label>
                    <p>{selectedObject.className}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Properties</h3>
                  {renderFormFields(
                    classes.find(
                      (c) => c.className === selectedObject.className,
                    )!,
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditObject(false);
                      setFormData({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditObject}>
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
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
              <AlertDialogCancel onClick={() => setObjectToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  objectToDelete && handleDeleteObject(objectToDelete)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
