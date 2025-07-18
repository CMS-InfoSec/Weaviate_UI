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
import {
  Database,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Settings,
  Copy,
} from "lucide-react";
import { useState } from "react";

interface Property {
  name: string;
  dataType: string;
  description?: string;
  tokenization?: string;
  vectorizer?: string;
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
        },
        {
          name: "content",
          dataType: "text",
          description: "Article content",
          tokenization: "word",
        },
        {
          name: "author",
          dataType: "text",
          description: "Article author",
          tokenization: "field",
        },
        {
          name: "publishedDate",
          dataType: "date",
          description: "Publication date",
        },
        {
          name: "category",
          dataType: "text",
          description: "Article category",
          tokenization: "field",
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
        },
        {
          name: "bio",
          dataType: "text",
          description: "Biography",
          tokenization: "word",
        },
        {
          name: "email",
          dataType: "text",
          description: "Email address",
          tokenization: "field",
        },
        {
          name: "birthDate",
          dataType: "date",
          description: "Date of birth",
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
        },
        {
          name: "description",
          dataType: "text",
          description: "Company description",
          tokenization: "word",
        },
        {
          name: "industry",
          dataType: "text",
          description: "Industry sector",
          tokenization: "field",
        },
        {
          name: "foundedYear",
          dataType: "int",
          description: "Year founded",
        },
      ],
    },
  ]);

  const [selectedClass, setSelectedClass] = useState<WeaviateClass | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClass, setShowAddClass] = useState(false);
  const [showClassDetail, setShowClassDetail] = useState(false);

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                    <Label htmlFor="className">Class Name</Label>
                    <Input id="className" placeholder="e.g., Article" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vectorizer">Vectorizer</Label>
                    <Select>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this class..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddClass(false)}
                  >
                    Cancel
                  </Button>
                  <Button>Create Class</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              Schema Classes
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedClass(cls);
                            setShowClassDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Class Detail Dialog */}
        <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
          <DialogContent className="max-w-4xl">
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
                    <Button size="sm">
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
                              <TableCell className="max-w-xs truncate">
                                {property.description || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Class
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
