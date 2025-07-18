import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ConnectionProfile {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  description?: string;
  isDefault?: boolean;
  lastTested?: Date;
  status?: "connected" | "error" | "untested";
}

export default function ConnectionStatus() {
  const [currentConnection, setCurrentConnection] =
    useState<ConnectionProfile | null>(null);

  useEffect(() => {
    // Load current connection from localStorage
    const loadCurrentConnection = () => {
      try {
        const savedProfiles = localStorage.getItem("weaviate-connections");
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          const defaultProfile = profiles.find(
            (p: ConnectionProfile) => p.isDefault,
          );
          setCurrentConnection(defaultProfile || null);
        }
      } catch (error) {
        console.warn("Failed to load connection status:", error);
      }
    };

    loadCurrentConnection();

    // Listen for storage changes (when connection is updated)
    const handleStorageChange = () => {
      loadCurrentConnection();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="h-3 w-3 text-green-500" />;
      case "error":
        return <WifiOff className="h-3 w-3 text-red-500" />;
      default:
        return <Database className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "connected":
        return "text-green-700 border-green-300 bg-green-50";
      case "error":
        return "text-red-700 border-red-300 bg-red-50";
      default:
        return "text-gray-700 border-gray-300 bg-gray-50";
    }
  };

  if (!currentConnection) {
    return (
      <Badge variant="outline" className="text-gray-700 border-gray-300">
        <Database className="h-3 w-3 mr-1" />
        No Connection
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`max-w-[200px] ${getStatusColor(currentConnection.status)}`}
    >
      <div className="flex items-center gap-1 min-w-0">
        {getStatusIcon(currentConnection.status)}
        <span className="truncate text-xs">{currentConnection.name}</span>
      </div>
    </Badge>
  );
}
