import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Settings,
  ExternalLink,
  FileText,
  Shield,
  Database,
  Info,
  Key,
  Users,
  Server,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configuration Information
            </h1>
            <p className="text-muted-foreground">
              Information about Weaviate configuration and management options
            </p>
          </div>
        </div>

        {/* Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Configuration is Environment-Based
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Weaviate configuration is managed through environment variables,
            configuration files, and deployment parameters. Settings cannot be
            changed through the REST API.
          </AlertDescription>
        </Alert>

        {/* Configuration Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Cluster Configuration
              </CardTitle>
              <CardDescription>
                Core Weaviate cluster settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Storage & Persistence</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure data persistence, storage paths, and backup
                      locations through environment variables
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Resource Limits</h4>
                    <p className="text-sm text-muted-foreground">
                      Memory limits, CPU allocation, and performance tuning
                      parameters set at deployment time
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Module Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable and configure vectorizers, generators, and other
                      modules through ENABLE_MODULES environment variable
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Authentication and authorization configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Key className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">API Keys</h4>
                    <p className="text-sm text-muted-foreground">
                      API authentication keys are configured through environment
                      variables, not managed via API
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">User Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Weaviate uses external authentication providers (OIDC) or
                      API keys, not built-in user management
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Authorization rules are configured at the infrastructure
                      level, not through the Weaviate API
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Common Configuration Examples</CardTitle>
            <CardDescription>
              Environment variables and configuration options for Weaviate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Core Environment Variables</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm space-y-1">
                  <div>QUERY_DEFAULTS_LIMIT=25</div>
                  <div>AUTHENTICATION_APIKEY_ENABLED=true</div>
                  <div>AUTHENTICATION_APIKEY_ALLOWED_KEYS=your-secret-key</div>
                  <div>PERSISTENCE_DATA_PATH=/var/lib/weaviate</div>
                  <div>DEFAULT_VECTORIZER_MODULE=text2vec-openai</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Module Configuration</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm space-y-1">
                  <div>ENABLE_MODULES=text2vec-openai,generative-openai</div>
                  <div>OPENAI_APIKEY=your-openai-key</div>
                  <div>COHERE_APIKEY=your-cohere-key</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Docker Compose Example</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>services:</div>
                  <div>&nbsp;&nbsp;weaviate:</div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;image: semitechnologies/weaviate
                  </div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;environment:</div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    QUERY_DEFAULTS_LIMIT=25
                  </div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    AUTHENTICATION_APIKEY_ENABLED=true
                  </div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    PERSISTENCE_DATA_PATH=/var/lib/weaviate
                  </div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    ENABLE_MODULES=text2vec-openai
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Instance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Instance Information</CardTitle>
            <CardDescription>
              Information about this Weaviate instance (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Endpoint</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  https://weaviate.cmsinfosec.com/v1
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">UI Location</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  https://vectorui.cmsinfosec.com
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Managed via environment variables
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
            <CardDescription>
              Learn more about Weaviate configuration and deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Weaviate Configuration Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Environment Variables Reference
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Authentication & Security Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Docker & Kubernetes Deployment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
