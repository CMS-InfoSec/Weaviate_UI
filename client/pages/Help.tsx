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
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Search,
  Book,
  MessageSquare,
  ExternalLink,
  Download,
  Play,
  Settings,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Bug,
  LifeBuoy,
  FileText,
  Video,
  Github,
  Mail,
  Phone,
  Clock,
  Users,
  Lightbulb,
  Target,
  ArrowRight,
  Copy,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import API_CONFIG from "@/lib/api";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  command?: string;
  expected?: string;
}

export default function Help() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  // FAQ Data
  const faqItems: FAQItem[] = [
    {
      id: "what-is-weaviate",
      category: "general",
      question: "What is Weaviate?",
      answer:
        "Weaviate is an open-source vector database that stores both objects and vectors, allowing for combining vector search with structured filtering. It uses machine learning models to vectorize and query data, making it perfect for semantic search, recommendation systems, and AI applications.",
      tags: ["vector database", "introduction", "basics"],
    },
    {
      id: "getting-started",
      category: "general",
      question: "How do I get started with Weaviate?",
      answer:
        "To get started: 1) Set up a Weaviate instance using Docker or Weaviate Cloud, 2) Define your data schema, 3) Import your data, 4) Start querying with GraphQL or REST API. This admin UI helps you manage your schema, browse objects, and monitor your cluster.",
      tags: ["getting started", "setup", "quickstart"],
    },
    {
      id: "schema-definition",
      category: "schema",
      question: "How do I define a schema?",
      answer:
        "Use the Schema page to create classes and properties. Each class represents a data type (like 'Article' or 'Product'), and properties define the attributes (like 'title', 'description'). You can set vectorizers, data types, and cross-references between classes.",
      tags: ["schema", "classes", "properties"],
    },
    {
      id: "data-import",
      category: "data",
      question: "How do I import data into Weaviate?",
      answer:
        "You can import data using: 1) The REST API with batch imports, 2) Client libraries (Python, JavaScript, Go, Java), 3) The Objects page in this admin UI for manual entry. For large datasets, use batch operations for better performance.",
      tags: ["import", "data", "batch", "API"],
    },
    {
      id: "vector-search",
      category: "search",
      question: "How does vector search work?",
      answer:
        "Weaviate uses machine learning models (vectorizers) to convert your data into high-dimensional vectors. When you search, your query is also vectorized and compared to stored vectors using similarity measures. This enables semantic search that understands meaning, not just keywords.",
      tags: ["vector search", "semantic", "similarity"],
    },
    {
      id: "graphql-queries",
      category: "search",
      question: "How do I write GraphQL queries?",
      answer:
        "Use the GraphQL explorer in the DevTools page. Basic structure: { Get { ClassName { property1 property2 _additional { certainty } } } }. You can add where filters, near text/vector searches, and aggregations. The explorer provides autocomplete and examples.",
      tags: ["GraphQL", "queries", "search"],
    },
    {
      id: "performance-optimization",
      category: "performance",
      question: "How can I optimize Weaviate performance?",
      answer:
        "Key optimizations: 1) Use batch imports for large datasets, 2) Choose appropriate vectorizers for your data, 3) Configure HNSW parameters for your use case, 4) Use filtering to reduce search space, 5) Monitor memory usage and scale horizontally if needed.",
      tags: ["performance", "optimization", "scaling"],
    },
    {
      id: "backup-restore",
      category: "administration",
      question: "How do I backup and restore data?",
      answer:
        "Configure backup modules (filesystem, S3, GCS) via environment variables. Use the Backup page to understand configuration options. Backups include both data and schema. Restore operations create new classes, so ensure no naming conflicts exist.",
      tags: ["backup", "restore", "data protection"],
    },
    {
      id: "authentication",
      category: "security",
      question: "How do I secure my Weaviate instance?",
      answer:
        "Security options: 1) API key authentication (AUTHENTICATION_APIKEY_ENABLED), 2) OIDC integration for SSO, 3) Network-level security (firewalls, VPNs), 4) TLS encryption. Configure authentication through environment variables at deployment time.",
      tags: ["security", "authentication", "API keys"],
    },
    {
      id: "modules",
      category: "configuration",
      question: "How do I configure modules?",
      answer:
        "Modules are configured at deployment time using environment variables. Set ENABLE_MODULES with a comma-separated list (e.g., 'text2vec-openai,generative-openai'). Each module may require additional configuration like API keys (OPENAI_APIKEY).",
      tags: ["modules", "configuration", "environment"],
    },
    {
      id: "cors-errors",
      category: "troubleshooting",
      question: "Why am I seeing CORS errors?",
      answer:
        "CORS errors occur when accessing Weaviate from a different domain. In development, you might see this when the admin UI (localhost:3000) tries to access Weaviate (localhost:8080). Configure CORS_ALLOW_ORIGIN or use a proxy setup.",
      tags: ["CORS", "errors", "development"],
    },
    {
      id: "connection-issues",
      category: "troubleshooting",
      question: "Weaviate instance is not connecting",
      answer:
        "Check: 1) Weaviate is running (docker ps), 2) Correct endpoint URL, 3) Network connectivity, 4) Firewall settings, 5) Authentication credentials if enabled. Use the diagnostics tool below to test connectivity.",
      tags: ["connection", "troubleshooting", "network"],
    },
  ];

  // Troubleshooting steps
  const troubleshootingSteps: TroubleshootingStep[] = [
    {
      id: "check-connection",
      title: "Check Weaviate Connection",
      description:
        "Verify that your Weaviate instance is running and accessible",
      command: "curl http://localhost:8080/v1/meta",
      expected: "Should return Weaviate version and configuration",
    },
    {
      id: "check-schema",
      title: "Verify Schema",
      description: "Ensure your schema is properly configured",
      command: "curl http://localhost:8080/v1/schema",
      expected: "Should return your defined classes and properties",
    },
    {
      id: "check-objects",
      title: "Check Object Count",
      description: "Verify that objects are being stored",
      command: "curl http://localhost:8080/v1/objects?limit=1",
      expected: "Should return object count and sample data",
    },
    {
      id: "check-modules",
      title: "Verify Modules",
      description: "Check which modules are enabled",
      action: "Look at the /v1/meta response for enabled modules",
      expected: "Should show configured vectorizers and other modules",
    },
  ];

  // Filter FAQ items based on search and category
  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Run diagnostics
  const runDiagnostics = async () => {
    setDiagnosticRunning(true);
    const results = {
      connection: { status: "unknown", message: "", details: null },
      schema: { status: "unknown", message: "", details: null },
      objects: { status: "unknown", message: "", details: null },
    };

    try {
      // Test connection
      try {
        const meta = await API_CONFIG.get("/meta");
        results.connection = {
          status: "success",
          message: `Connected to Weaviate ${meta.version}`,
          details: meta,
        };
      } catch (error) {
        results.connection = {
          status: "error",
          message: error instanceof Error ? error.message : "Connection failed",
          details: null,
        };
      }

      // Test schema
      try {
        const schema = await API_CONFIG.get("/schema");
        const classCount = schema.classes ? schema.classes.length : 0;
        results.schema = {
          status: classCount > 0 ? "success" : "warning",
          message:
            classCount > 0
              ? `Found ${classCount} classes`
              : "No classes defined",
          details: schema,
        };
      } catch (error) {
        results.schema = {
          status: "error",
          message: "Could not fetch schema",
          details: null,
        };
      }

      // Test objects
      try {
        const objects = await API_CONFIG.get("/objects?limit=1");
        const objectCount = objects.totalResults || 0;
        results.objects = {
          status: objectCount > 0 ? "success" : "warning",
          message:
            objectCount > 0
              ? `Found ${objectCount} objects`
              : "No objects found",
          details: objects,
        };
      } catch (error) {
        results.objects = {
          status: "error",
          message: "Could not fetch objects",
          details: null,
        };
      }
    } catch (error) {
      console.error("Diagnostics failed:", error);
    }

    setDiagnosticResults(results);
    setDiagnosticRunning(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Command copied successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Help & Documentation
            </h1>
            <p className="text-muted-foreground">
              Get help with Weaviate administration and troubleshooting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <a
                href="https://weaviate.io/developers/weaviate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Official Docs
              </a>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Start Guide
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Get up and running in minutes
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                API Reference
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Complete API documentation
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Video Tutorials
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Step-by-step video guides
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Forum
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Get help from the community
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              <Bug className="h-4 w-4 mr-2" />
              Troubleshooting
            </TabsTrigger>
            <TabsTrigger value="guides">
              <Book className="h-4 w-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="support">
              <LifeBuoy className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  All
                </Button>
                <Button
                  variant={activeCategory === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("general")}
                >
                  General
                </Button>
                <Button
                  variant={activeCategory === "schema" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("schema")}
                >
                  Schema
                </Button>
                <Button
                  variant={activeCategory === "search" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("search")}
                >
                  Search
                </Button>
                <Button
                  variant={
                    activeCategory === "troubleshooting" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveCategory("troubleshooting")}
                >
                  Issues
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <span>{item.question}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p className="text-sm">{item.answer}</p>
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No FAQ items found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or category filter.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    System Diagnostics
                  </CardTitle>
                  <CardDescription>
                    Run automated checks to diagnose common issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={runDiagnostics}
                    disabled={diagnosticRunning}
                    className="w-full"
                  >
                    {diagnosticRunning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running Diagnostics...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Diagnostics
                      </>
                    )}
                  </Button>

                  {diagnosticResults && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnosticResults.connection.status)}
                        <span className="font-medium">Connection</span>
                        <span className="text-sm text-muted-foreground">
                          {diagnosticResults.connection.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnosticResults.schema.status)}
                        <span className="font-medium">Schema</span>
                        <span className="text-sm text-muted-foreground">
                          {diagnosticResults.schema.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnosticResults.objects.status)}
                        <span className="font-medium">Objects</span>
                        <span className="text-sm text-muted-foreground">
                          {diagnosticResults.objects.message}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Fixes
                  </CardTitle>
                  <CardDescription>
                    Common solutions for frequent issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">CORS Issues</h4>
                    <p className="text-xs text-muted-foreground">
                      Add CORS_ALLOW_ORIGIN=* to your Weaviate environment
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Connection Refused</h4>
                    <p className="text-xs text-muted-foreground">
                      Check if Weaviate is running on the correct port
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Schema Not Found</h4>
                    <p className="text-xs text-muted-foreground">
                      Create classes in the Schema page before importing data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Steps</CardTitle>
                <CardDescription>
                  Follow these steps to diagnose and resolve issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {troubleshootingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.command && (
                          <div className="bg-muted p-3 rounded font-mono text-sm flex items-center justify-between">
                            <code>{step.command}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(step.command)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {step.expected && (
                          <p className="text-xs text-green-600">
                            Expected: {step.expected}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-5 w-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Complete guide to setting up and configuring Weaviate
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>15 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/quickstart"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-5 w-5" />
                    Schema Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Best practices for designing efficient schemas
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>20 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/config-refs/schema"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5" />
                    Vector Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Understanding and optimizing vector search queries
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>25 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/search"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Download className="h-5 w-5" />
                    Data Import
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Efficient strategies for importing large datasets
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>18 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/manage-data/import"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-5 w-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Advanced configuration and deployment options
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>30 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/configuration"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LifeBuoy className="h-5 w-5" />
                    Production Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Best practices for running Weaviate in production
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>35 min read</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href="https://weaviate.io/developers/weaviate/deployment"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Community Support
                  </CardTitle>
                  <CardDescription>
                    Get help from the Weaviate community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full">
                    <a
                      href="https://forum.weaviate.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Community Forum
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a
                      href="https://weaviate.io/slack"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Join Slack
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a
                      href="https://github.com/weaviate/weaviate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Issues
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Enterprise Support
                  </CardTitle>
                  <CardDescription>
                    Professional support for enterprise customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">SLA Guarantees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority Response</span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <a
                      href="https://weaviate.io/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How to reach the Weaviate team
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      hello@weaviate.io
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      weaviate/weaviate
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-muted-foreground">
                      weaviate.io/slack
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
