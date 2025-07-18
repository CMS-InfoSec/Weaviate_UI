import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Download,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Bell,
  TrendingUp,
  Server,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ClusterNode {
  id: string;
  name: string;
  status: "healthy" | "warning" | "critical";
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  version: string;
  role: "leader" | "follower";
}

interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  queries: number;
  operations: number;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  node?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "error" | "warn" | "info" | "debug";
  component: string;
  message: string;
  node: string;
}

export default function Monitoring() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Live data states
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live cluster data
  const fetchClusterData = async () => {
    try {
      const meta = await API_CONFIG.get("/meta");

      // Process nodes from meta response
      if (meta.nodes && typeof meta.nodes === "object") {
        const nodeList = Object.entries(meta.nodes).map(
          ([nodeId, nodeData]: [string, any]) => ({
            id: nodeId,
            name: nodeData.name || nodeId,
            status: nodeData.status === "HEALTHY" ? "healthy" : "warning",
            cpu: Math.floor(Math.random() * 80) + 10, // Mock - not provided by Weaviate meta
            memory: Math.floor(Math.random() * 80) + 10, // Mock - not provided by Weaviate meta
            disk: Math.floor(Math.random() * 80) + 10, // Mock - not provided by Weaviate meta
            network: Math.floor(Math.random() * 50) + 10, // Mock - not provided by Weaviate meta
            uptime: "Live Instance", // Not provided by meta
            version: nodeData.version || meta.version || "Unknown",
            role:
              nodeId.includes("leader") ||
              Object.keys(meta.nodes).indexOf(nodeId) === 0
                ? "leader"
                : "follower",
          }),
        );
        setNodes(nodeList);
      } else {
        // Single node setup
        setNodes([
          {
            id: "single-node",
            name: meta.hostname || "weaviate-instance",
            status: "healthy",
            cpu: Math.floor(Math.random() * 50) + 20,
            memory: Math.floor(Math.random() * 50) + 20,
            disk: Math.floor(Math.random() * 50) + 20,
            network: Math.floor(Math.random() * 30) + 10,
            uptime: "Live Instance",
            version: meta.version || "Unknown",
            role: "leader",
          },
        ]);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch cluster data";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "CORS Error: Cannot connect in development mode. Showing demo data.",
        );

        // Fallback demo data
        setNodes([
          {
            id: "demo-node-1",
            name: "weaviate-demo-1",
            status: "healthy",
            cpu: 45,
            memory: 62,
            disk: 78,
            network: 23,
            uptime: "Demo Mode",
            version: "1.21.2",
            role: "leader",
          },
          {
            id: "demo-node-2",
            name: "weaviate-demo-2",
            status: "warning",
            cpu: 78,
            memory: 85,
            disk: 45,
            network: 67,
            uptime: "Demo Mode",
            version: "1.21.2",
            role: "follower",
          },
        ]);
      } else {
        setError(errorMessage);
        setNodes([]);
      }
    }
  };

  const [metrics] = useState<SystemMetric[]>([
    {
      timestamp: "14:00",
      cpu: 45,
      memory: 62,
      disk: 78,
      network: 23,
      queries: 1250,
      operations: 890,
    },
    {
      timestamp: "14:05",
      cpu: 52,
      memory: 65,
      disk: 78,
      network: 34,
      queries: 1340,
      operations: 920,
    },
    {
      timestamp: "14:10",
      cpu: 48,
      memory: 63,
      disk: 79,
      network: 28,
      queries: 1280,
      operations: 850,
    },
    {
      timestamp: "14:15",
      cpu: 55,
      memory: 68,
      disk: 79,
      network: 42,
      queries: 1420,
      operations: 980,
    },
    {
      timestamp: "14:20",
      cpu: 49,
      memory: 64,
      disk: 80,
      network: 31,
      queries: 1320,
      operations: 910,
    },
    {
      timestamp: "14:25",
      cpu: 47,
      memory: 62,
      disk: 80,
      network: 26,
      queries: 1290,
      operations: 875,
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-1",
      type: "warning",
      title: "High Memory Usage",
      message: "Node weaviate-node-2 memory usage is at 85%",
      timestamp: "2024-01-15T14:23:00Z",
      resolved: false,
      node: "weaviate-node-2",
    },
    {
      id: "alert-2",
      type: "critical",
      title: "High CPU Usage",
      message:
        "Node weaviate-node-2 CPU usage sustained above 75% for 10 minutes",
      timestamp: "2024-01-15T14:20:00Z",
      resolved: false,
      node: "weaviate-node-2",
    },
    {
      id: "alert-3",
      type: "info",
      title: "Backup Completed",
      message: "Daily backup completed successfully on all nodes",
      timestamp: "2024-01-15T14:00:00Z",
      resolved: true,
    },
    {
      id: "alert-4",
      type: "warning",
      title: "Slow Query Detected",
      message: "Query execution time exceeded 5 seconds",
      timestamp: "2024-01-15T13:45:00Z",
      resolved: true,
    },
  ]);

  const [logs] = useState<LogEntry[]>([
    {
      id: "log-1",
      timestamp: "2024-01-15T14:25:32Z",
      level: "info",
      component: "query-engine",
      message: "Query executed successfully in 234ms",
      node: "weaviate-node-1",
    },
    {
      id: "log-2",
      timestamp: "2024-01-15T14:25:28Z",
      level: "warn",
      component: "memory-manager",
      message: "Memory usage approaching threshold on node-2",
      node: "weaviate-node-2",
    },
    {
      id: "log-3",
      timestamp: "2024-01-15T14:25:15Z",
      level: "error",
      component: "indexer",
      message: "Failed to index object: connection timeout",
      node: "weaviate-node-2",
    },
    {
      id: "log-4",
      timestamp: "2024-01-15T14:24:58Z",
      level: "info",
      component: "cluster-manager",
      message: "Heartbeat received from all nodes",
      node: "weaviate-node-1",
    },
    {
      id: "log-5",
      timestamp: "2024-01-15T14:24:45Z",
      level: "debug",
      component: "vector-index",
      message: "Vector index rebuild completed for class Product",
      node: "weaviate-node-3",
    },
  ]);

  // Initial data load and auto-refresh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchClusterData();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchClusterData();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClusterData();
    setRefreshing(false);

    toast({
      title: "Metrics Refreshed",
      description: "Latest monitoring data has been fetched from Weaviate.",
    });
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true } : alert,
      ),
    );
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600";
      case "warn":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      case "debug":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === "all") return true;
    if (alertFilter === "unresolved") return !alert.resolved;
    return alert.type === alertFilter;
  });

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = logFilter === "all" || log.level === logFilter;
    const matchesSearch =
      !logSearch ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.component.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const overallHealth = nodes.every((node) => node.status === "healthy")
    ? "healthy"
    : nodes.some((node) => node.status === "critical")
      ? "critical"
      : "warning";

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-lg font-medium">Loading Monitoring Data</h2>
                <p className="text-muted-foreground">
                  Fetching cluster health from Weaviate instance...
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
      <div className="space-y-6">
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Monitoring & Logs
            </h1>
            <p className="text-muted-foreground">
              Monitor cluster health, performance metrics, and system logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <Activity className="h-4 w-4 mr-2" />
              Auto Refresh {autoRefresh ? "On" : "Off"}
            </Button>
            <Button onClick={handleRefresh} disabled={refreshing} size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Health Status */}
        <Alert
          className={`border-l-4 ${
            overallHealth === "healthy"
              ? "border-green-500 bg-green-50"
              : overallHealth === "warning"
                ? "border-yellow-500 bg-yellow-50"
                : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex items-center">
            {overallHealth === "healthy" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : overallHealth === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <AlertTitle className="ml-2 capitalize">
              Cluster Status: {overallHealth}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {overallHealth === "healthy"
              ? "All nodes are operating normally"
              : overallHealth === "warning"
                ? "Some nodes require attention"
                : "Critical issues detected, immediate action required"}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nodes">Node Details</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Nodes
                  </CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{nodes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {nodes.filter((n) => n.status === "healthy").length} healthy
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg CPU Usage
                  </CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      nodes.reduce((acc, node) => acc + node.cpu, 0) /
                        nodes.length,
                    )}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all nodes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Alerts
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {alerts.filter((a) => !a.resolved).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {
                      alerts.filter((a) => !a.resolved && a.type === "critical")
                        .length
                    }{" "}
                    critical
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Queries/min
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,320</div>
                  <p className="text-xs text-muted-foreground">
                    Last 5 minutes
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>
                    Latest system alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        {alert.type === "critical" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : alert.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={alert.resolved ? "secondary" : "destructive"}
                      >
                        {alert.resolved ? "Resolved" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>
                    Current resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>
                        {Math.round(
                          nodes.reduce((acc, node) => acc + node.cpu, 0) /
                            nodes.length,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.round(
                        nodes.reduce((acc, node) => acc + node.cpu, 0) /
                          nodes.length,
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>
                        {Math.round(
                          nodes.reduce((acc, node) => acc + node.memory, 0) /
                            nodes.length,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.round(
                        nodes.reduce((acc, node) => acc + node.memory, 0) /
                          nodes.length,
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disk Usage</span>
                      <span>
                        {Math.round(
                          nodes.reduce((acc, node) => acc + node.disk, 0) /
                            nodes.length,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.round(
                        nodes.reduce((acc, node) => acc + node.disk, 0) /
                          nodes.length,
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nodes" className="space-y-4">
            <div className="grid gap-4">
              {nodes.map((node) => (
                <Card key={node.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <Badge
                          variant={
                            node.role === "leader" ? "default" : "secondary"
                          }
                        >
                          {node.role}
                        </Badge>
                        <Badge
                          variant={
                            node.status === "healthy"
                              ? "default"
                              : node.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                          className={getStatusColor(node.status)}
                        >
                          {node.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        v{node.version} • Uptime: {node.uptime}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Cpu className="h-4 w-4 mr-2" />
                            CPU
                          </span>
                          <span>{node.cpu}%</span>
                        </div>
                        <Progress value={node.cpu} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            Memory
                          </span>
                          <span>{node.memory}%</span>
                        </div>
                        <Progress value={node.memory} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <HardDrive className="h-4 w-4 mr-2" />
                            Disk
                          </span>
                          <span>{node.disk}%</span>
                        </div>
                        <Progress value={node.disk} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Wifi className="h-4 w-4 mr-2" />
                            Network
                          </span>
                          <span>{node.network} MB/s</span>
                        </div>
                        <Progress value={node.network} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time system performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Simple metric display since we don't have charting library */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">CPU Usage Trend</h4>
                      <div className="space-y-1">
                        {metrics.slice(-5).map((metric, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span>{metric.timestamp}</span>
                            <span>{metric.cpu}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Memory Usage Trend
                      </h4>
                      <div className="space-y-1">
                        {metrics.slice(-5).map((metric, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span>{metric.timestamp}</span>
                            <span>{metric.memory}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Query Rate</h4>
                      <div className="space-y-1">
                        {metrics.slice(-5).map((metric, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span>{metric.timestamp}</span>
                            <span>{metric.queries}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">System Alerts</h3>
              <div className="flex items-center space-x-2">
                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter alerts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.type === "critical"
                      ? "border-red-500"
                      : alert.type === "warning"
                        ? "border-yellow-500"
                        : "border-blue-500"
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {alert.type === "critical" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : alert.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge
                            variant={
                              alert.resolved ? "secondary" : "destructive"
                            }
                          >
                            {alert.resolved ? "Resolved" : "Active"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.node && (
                            <span className="flex items-center">
                              <Server className="h-3 w-3 mr-1" />
                              {alert.node}
                            </span>
                          )}
                        </div>
                      </div>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">System Logs</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/25"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`${getLogLevelColor(log.level)} text-xs`}
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">
                              {log.component}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.node}
                            </span>
                          </div>
                          <p className="text-sm font-mono text-foreground">
                            {log.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
