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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Link as LinkIcon,
  Search,
  ArrowRight,
  Network,
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import API_CONFIG from "@/lib/api";

interface ReferenceProperty {
  name: string;
  dataType: string[];
  targetClass?: string;
  description?: string;
}

interface ClassSchema {
  class: string;
  properties: Array<{
    name: string;
    dataType: string | string[];
    description?: string;
  }>;
}

interface ObjectWithReferences {
  id: string;
  class: string;
  properties: Record<string, any>;
  references?: Array<{
    property: string;
    target: string;
    targetClass: string;
  }>;
}

export default function References() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<ClassSchema[]>([]);
  const [objectsWithReferences, setObjectsWithReferences] = useState<
    ObjectWithReferences[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch schema and objects with references
  const fetchReferenceData = async () => {
    try {
      // Fetch schema
      const schema = await API_CONFIG.get("/schema");
      const schemaClasses = schema.classes || [];
      setSchemas(schemaClasses);

      // Find reference properties in schema
      const referenceProperties: ReferenceProperty[] = [];
      schemaClasses.forEach((cls: any) => {
        cls.properties?.forEach((prop: any) => {
          if (
            Array.isArray(prop.dataType) &&
            prop.dataType.some(
              (type: string) =>
                type !== "text" &&
                type !== "number" &&
                type !== "boolean" &&
                type !== "date",
            )
          ) {
            referenceProperties.push({
              name: prop.name,
              dataType: prop.dataType,
              targetClass: prop.dataType.find(
                (type: string) =>
                  type !== "text" &&
                  type !== "number" &&
                  type !== "boolean" &&
                  type !== "date",
              ),
              description: prop.description,
            });
          }
        });
      });

      // Fetch objects that might have references
      const objects = await API_CONFIG.get("/objects?limit=50");
      const objectsData = objects.objects || [];

      // Process objects to extract reference information
      const processedObjects: ObjectWithReferences[] = objectsData
        .map((obj: any) => {
          const references: Array<{
            property: string;
            target: string;
            targetClass: string;
          }> = [];

          // Check object properties for references
          Object.entries(obj.properties || {}).forEach(([key, value]) => {
            if (value && typeof value === "object" && value.beacon) {
              // This is a reference
              references.push({
                property: key,
                target: value.beacon,
                targetClass: value.beacon.split("/").pop() || "Unknown",
              });
            }
          });

          return {
            id: obj.id,
            class: obj.class || "Unknown",
            properties: obj.properties || {},
            references: references.length > 0 ? references : undefined,
          };
        })
        .filter((obj) => obj.references && obj.references.length > 0);

      setObjectsWithReferences(processedObjects);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch reference data";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. References are part of object data.",
        );

        // Demo schema with reference properties
        setSchemas([
          {
            class: "Article",
            properties: [
              { name: "title", dataType: ["text"] },
              {
                name: "author",
                dataType: ["User"],
                description: "Article author",
              },
              { name: "category", dataType: ["Category"] },
            ],
          },
          {
            class: "User",
            properties: [
              { name: "name", dataType: ["text"] },
              { name: "email", dataType: ["text"] },
            ],
          },
        ]);

        // Demo objects with references
        setObjectsWithReferences([
          {
            id: "demo-article-1",
            class: "Article",
            properties: {
              title: "Understanding Vector Databases",
            },
            references: [
              {
                property: "author",
                target: "weaviate://localhost/User/demo-user-1",
                targetClass: "User",
              },
            ],
          },
        ]);

        toast({
          title: "Development Mode",
          description:
            "CORS prevents live connection. Showing demo references.",
        });
      } else {
        setError(errorMessage);
        setSchemas([]);
        setObjectsWithReferences([]);
        toast({
          title: "References Error",
          description: `Could not fetch reference data: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReferenceData();
    setRefreshing(false);

    toast({
      title: "References Refreshed",
      description: "Reference data has been updated from Weaviate.",
    });
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchReferenceData();
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter objects by search term
  const filteredObjects = objectsWithReferences.filter((obj) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      obj.id.toLowerCase().includes(searchLower) ||
      obj.class.toLowerCase().includes(searchLower) ||
      Object.values(obj.properties).some((value) =>
        String(value).toLowerCase().includes(searchLower),
      )
    );
  });

  // Get reference properties from schema
  const getReferenceProperties = () => {
    const refProps: ReferenceProperty[] = [];
    schemas.forEach((cls) => {
      cls.properties?.forEach((prop) => {
        if (
          Array.isArray(prop.dataType) &&
          prop.dataType.some(
            (type) =>
              !["text", "number", "boolean", "date", "uuid"].includes(type),
          )
        ) {
          refProps.push({
            name: prop.name,
            dataType: Array.isArray(prop.dataType)
              ? prop.dataType
              : [prop.dataType],
            targetClass: Array.isArray(prop.dataType)
              ? prop.dataType.find(
                  (type) =>
                    !["text", "number", "boolean", "date", "uuid"].includes(
                      type,
                    ),
                )
              : undefined,
            description: prop.description,
          });
        }
      });
    });
    return refProps;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Loading References</h2>
                <p className="text-muted-foreground">
                  Analyzing objects for reference relationships...
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
              Object References
            </h1>
            <p className="text-muted-foreground">
              View reference relationships between objects in your Weaviate
              database
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

        {/* Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            About Object References
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            References in Weaviate link objects together. They are defined in
            the schema and stored as part of object properties. This page shows
            existing reference relationships found in your data.
          </AlertDescription>
        </Alert>

        {/* Reference Properties in Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Reference Properties in Schema
            </CardTitle>
            <CardDescription>
              Properties defined in your schema that can hold references to
              other objects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getReferenceProperties().length === 0 ? (
              <div className="text-center py-8">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Reference Properties Found
                </h3>
                <p className="text-muted-foreground">
                  No reference properties are defined in your current schema.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Target Class</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getReferenceProperties().map((prop, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{prop.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {prop.targetClass || "Multiple"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {prop.description || "No description"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search objects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredObjects.length} objects with references
          </div>
        </div>

        {/* Objects with References */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Objects with References
            </CardTitle>
            <CardDescription>
              Objects in your database that have reference relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredObjects.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No References Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No objects with references match your search."
                    : "No objects with reference relationships were found in your database."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredObjects.map((obj) => (
                  <Card key={obj.id} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {obj.id.substring(0, 8)}...
                            </span>
                            <Badge variant="outline">{obj.class}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Properties:</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {Object.entries(obj.properties)
                              .slice(0, 4)
                              .map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span>{" "}
                                  <span className="text-muted-foreground">
                                    {String(value).substring(0, 50)}
                                    {String(value).length > 50 ? "..." : ""}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">References:</h4>
                          <div className="space-y-1">
                            {obj.references?.map((ref, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 p-2 bg-muted rounded"
                              >
                                <ArrowRight className="h-3 w-3 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {ref.property}
                                </span>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                <Badge variant="secondary">
                                  {ref.targetClass}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {ref.target.split("/").pop()?.substring(0, 8)}
                                  ...
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
