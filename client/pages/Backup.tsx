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
  Archive,
  ExternalLink,
  FileText,
  Settings,
  Database,
  Info,
} from "lucide-react";

export default function Backup() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Backup & Restore
            </h1>
            <p className="text-muted-foreground">
              Information about Weaviate backup configuration and options
            </p>
          </div>
        </div>

        {/* Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Backup Configuration Required
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Weaviate backup functionality is configured at the infrastructure
            level through environment variables, Docker volumes, or Kubernetes
            configurations. It is not managed through the REST API.
          </AlertDescription>
        </Alert>

        {/* Available Backup Methods */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="h-5 w-5 mr-2" />
                Built-in Backup Module
              </CardTitle>
              <CardDescription>
                Weaviate's native backup functionality for production use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic backups through environment variables
                      and storage backends (S3, GCS, filesystem)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Restoration</h4>
                    <p className="text-sm text-muted-foreground">
                      Restore data from backups during cluster initialization or
                      through configuration management
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Class-level Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      Selective backup and restore of specific classes and their
                      data
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Infrastructure-Level Options
              </CardTitle>
              <CardDescription>
                Alternative backup strategies for your deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Docker Volume Backups</h4>
                  <p className="text-sm text-muted-foreground">
                    Back up Docker volumes containing Weaviate data directories
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Kubernetes Snapshots</h4>
                  <p className="text-sm text-muted-foreground">
                    Use persistent volume snapshots in Kubernetes environments
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Export/Import via API</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the REST API to export and import data programmatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Instructions</CardTitle>
            <CardDescription>
              How to set up backups for your Weaviate instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Environment Variables</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>BACKUP_FILESYSTEM_PATH=/var/lib/weaviate/backups</div>
                  <div>ENABLE_MODULES=backup-filesystem</div>
                  <div>BACKUP_S3_BUCKET=my-weaviate-backups</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Docker Compose Example</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>services:</div>
                  <div>&nbsp;&nbsp;weaviate:</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;environment:</div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    ENABLE_MODULES=backup-filesystem
                  </div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
                    BACKUP_FILESYSTEM_PATH=/backups
                  </div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;volumes:</div>
                  <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ./backups:/backups
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">API Endpoints (Read-Only)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-mono text-sm">GET /v1/backups</span>
                    <span className="text-sm text-muted-foreground">
                      List available backups
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-mono text-sm">
                      GET /v1/backups/{"{"}id{"}"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Get backup status
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-mono text-sm">
                      POST /v1/backups/{"{"}backend{"}"}/{"{"}id{"}"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Create backup (if configured)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
            <CardDescription>
              Learn more about Weaviate backup configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Weaviate Backup Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Backup Module Configuration Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Production Deployment Best Practices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
