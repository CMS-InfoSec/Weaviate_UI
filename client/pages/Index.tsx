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
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Database,
  FileText,
  Archive,
  Users,
  Server,
  Cpu,
  HardDrive,
  Network,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ClusterStatus {
  status: "healthy" | "warning" | "error";
  nodes: number;
  objects: number;
  classes: number;
  uptime: string;
}

interface NodeInfo {
  id: string;
  name: string;
  status: "online" | "offline" | "warning";
  cpu: number;
  memory: number;
  disk: number;
  version: string;
}

export default function Index() {
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus>({
    status: "healthy",
    nodes: 3,
    objects: 125643,
    classes: 8,
    uptime: "7d 14h 32m",
  });

  const [nodes, setNodes] = useState<NodeInfo[]>([
    {
      id: "node-1",
      name: "weaviate-node-1",
      status: "online",
      cpu: 65,
      memory: 78,
      disk: 45,
      version: "1.22.1",
    },
    {
      id: "node-2",
      name: "weaviate-node-2",
      status: "online",
      cpu: 58,
      memory: 72,
      disk: 52,
      version: "1.22.1",
    },
    {
      id: "node-3",
      name: "weaviate-node-3",
      status: "warning",
      cpu: 89,
      memory: 94,
      disk: 78,
      version: "1.22.1",
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
      case "offline":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your Weaviate cluster status and manage your data
          </p>
        </div>

        {/* Cluster Status Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Cluster Status
          </h2>

          {/* Cluster Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Cluster Overview
              </CardTitle>
              <CardDescription>
                Current status and metrics of your Weaviate cluster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(clusterStatus.status)}
                    <span className="text-sm font-medium">Cluster Status</span>
                  </div>
                  <Badge className={getStatusColor(clusterStatus.status)}>
                    {clusterStatus.status.charAt(0).toUpperCase() +
                      clusterStatus.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Nodes</span>
                  </div>
                  <p className="text-2xl font-bold">{clusterStatus.nodes}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Objects</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {clusterStatus.objects.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Classes</span>
                  </div>
                  <p className="text-2xl font-bold">{clusterStatus.classes}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <p className="text-lg font-semibold">{clusterStatus.uptime}</p>
              </div>
            </CardContent>
          </Card>

          {/* Node List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Node Status
              </CardTitle>
              <CardDescription>
                Individual node health and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nodes.map((node) => (
                  <div key={node.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(node.status)}
                        <div>
                          <h3 className="font-medium">{node.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            v{node.version}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(node.status)}>
                        {node.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm font-medium ml-auto">
                            {node.cpu}%
                          </span>
                        </div>
                        <Progress value={node.cpu} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Memory Usage</span>
                          <span className="text-sm font-medium ml-auto">
                            {node.memory}%
                          </span>
                        </div>
                        <Progress value={node.memory} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Disk Usage</span>
                          <span className="text-sm font-medium ml-auto">
                            {node.disk}%
                          </span>
                        </div>
                        <Progress value={node.disk} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="h-5 w-5 text-primary" />
                  Create Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Define a new data schema class with properties and
                  configuration
                </p>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Class
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  Create Object
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a new data object to your Weaviate instance
                </p>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Object
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Archive className="h-5 w-5 text-primary" />
                  Create Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a backup of your current data and schema
                </p>
                <Button className="w-full">
                  <Archive className="h-4 w-4 mr-2" />
                  Start Backup
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-5 w-5 text-primary" />
                  Bulk Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Import multiple objects from CSV or JSON files
                </p>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Network className="h-5 w-5 text-primary" />
                  GraphQL Query
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Open the GraphQL playground to test queries
                </p>
                <Button className="w-full" variant="outline">
                  <Network className="h-4 w-4 mr-2" />
                  Open Playground
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-primary" />
                  View Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor cluster activity and troubleshoot issues
                </p>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
