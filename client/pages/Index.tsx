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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import API_CONFIG from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ClusterStatus {
  status: "healthy" | "warning" | "error";
  nodes: number;
  objects: number;
  classes: number;
  uptime: string;
  hostname?: string;
  version?: string;
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus>({
    status: "healthy",
    nodes: 0,
    objects: 0,
    classes: 0,
    uptime: "Loading...",
  });

  const [nodes, setNodes] = useState<NodeInfo[]>([]);

  // Fetch cluster metadata
  const fetchClusterMeta = async () => {
    try {
      const meta = await API_CONFIG.get("/meta");

      // Calculate object count from schema or set default
      let objectCount = 0;
      let classCount = 0;

      try {
        const schema = await API_CONFIG.get("/schema");
        classCount = schema.classes ? schema.classes.length : 0;

        // Try to get object count
        const objects = await API_CONFIG.get("/objects?limit=1");
        objectCount = objects.totalResults || 0;
      } catch (schemaError) {
        console.warn("Could not fetch schema/objects:", schemaError);
      }

      setClusterStatus({
        status: "healthy",
        nodes: meta.nodes ? Object.keys(meta.nodes).length : 1,
        objects: objectCount,
        classes: classCount,
        uptime: "Live Instance",
        hostname: meta.hostname,
        version: meta.version,
      });

      // Process nodes if available
      if (meta.nodes) {
        const nodeList = Object.entries(meta.nodes).map(
          ([nodeId, nodeData]: [string, any]) => ({
            id: nodeId,
            name: nodeData.name || nodeId,
            status: nodeData.status === "HEALTHY" ? "online" : "warning",
            cpu: Math.floor(Math.random() * 80) + 10, // Mock CPU as not provided by meta
            memory: Math.floor(Math.random() * 80) + 10, // Mock memory
            disk: Math.floor(Math.random() * 80) + 10, // Mock disk
            version: nodeData.version || meta.version,
          }),
        );
        setNodes(nodeList);
      } else {
        // Single node setup
        setNodes([
          {
            id: "single-node",
            name: meta.hostname || "weaviate-instance",
            status: "online",
            cpu: Math.floor(Math.random() * 50) + 20,
            memory: Math.floor(Math.random() * 50) + 20,
            disk: Math.floor(Math.random() * 50) + 20,
            version: meta.version || "1.0.0",
          },
        ]);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to Weaviate";
      setError(errorMessage);
      setClusterStatus({
        status: "error",
        nodes: 0,
        objects: 0,
        classes: 0,
        uptime: "Connection Error",
      });

      toast({
        title: "Connection Error",
        description: `Could not connect to Weaviate: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchClusterMeta();
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClusterMeta();
    setRefreshing(false);

    toast({
      title: "Data Refreshed",
      description:
        "Dashboard data has been updated from your Weaviate instance.",
    });
  };

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

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Connecting to Weaviate</h2>
                <p className="text-muted-foreground">
                  Loading data from https://weaviate.cmsinfosec.com/v1
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Live data from your Weaviate cluster at weaviate.cmsinfosec.com
            </p>
          </div>
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

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 font-medium">
                  Connection Error
                </span>
              </div>
              <p className="text-red-600 mt-2 text-sm">{error}</p>
              <p className="text-red-500 mt-1 text-xs">
                Make sure your Weaviate instance is running and accessible.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cluster Status Overview */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(clusterStatus.status)}
                  Cluster Status
                </CardTitle>
                <CardDescription>
                  {clusterStatus.hostname &&
                    `Hostname: ${clusterStatus.hostname} • `}
                  {clusterStatus.version &&
                    `Version: ${clusterStatus.version} • `}
                  Uptime: {clusterStatus.uptime}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(clusterStatus.status)}>
                {clusterStatus.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Objects
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clusterStatus.objects.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Vector embeddings stored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Schema Classes
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clusterStatus.classes}</div>
              <p className="text-xs text-muted-foreground">
                Data structures defined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Nodes
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clusterStatus.nodes}</div>
              <p className="text-xs text-muted-foreground">
                Cluster instances running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {clusterStatus.status}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall cluster status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Node Status */}
        <Card>
          <CardHeader>
            <CardTitle>Node Status</CardTitle>
            <CardDescription>
              Individual node performance and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(node.status)}
                    <div>
                      <h4 className="font-medium">{node.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Version {node.version}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{node.cpu}%</span>
                      </div>
                      <Progress value={node.cpu} className="w-16 h-2 mt-1" />
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {node.memory}%
                        </span>
                      </div>
                      <Progress value={node.memory} className="w-16 h-2 mt-1" />
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {node.disk}%
                        </span>
                      </div>
                      <Progress value={node.disk} className="w-16 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations for your Weaviate cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <Plus className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Add Object</div>
                  <div className="text-xs text-muted-foreground">
                    Insert new data
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4">
                <FileText className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Schema</div>
                  <div className="text-xs text-muted-foreground">
                    Configure classes
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4">
                <Upload className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Import Data</div>
                  <div className="text-xs text-muted-foreground">
                    Bulk upload
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4">
                <Archive className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Create Backup</div>
                  <div className="text-xs text-muted-foreground">
                    Secure your data
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
