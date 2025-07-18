// API Configuration for Weaviate connection
export const API_CONFIG = {
  // Get Weaviate endpoint from environment variable
  WEAVIATE_ENDPOINT:
    (process.env as any).REACT_APP_WEAVIATE_ENDPOINT ||
    "https://weaviate.cmsinfosec.com/v1",

  // Get API key if provided
  WEAVIATE_API_KEY: (process.env as any).REACT_APP_WEAVIATE_API_KEY || "",

  // Default headers for API requests
  getHeaders: () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add API key if available
    if (API_CONFIG.WEAVIATE_API_KEY) {
      headers["Authorization"] = `Bearer ${API_CONFIG.WEAVIATE_API_KEY}`;
    }

    return headers;
  },

  // Helper function to build API URLs
  buildUrl: (path: string) => {
    const endpoint = API_CONFIG.WEAVIATE_ENDPOINT.endsWith("/")
      ? API_CONFIG.WEAVIATE_ENDPOINT.slice(0, -1)
      : API_CONFIG.WEAVIATE_ENDPOINT;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${endpoint}${cleanPath}`;
  },

  // Generic API request function
  request: async (path: string, options: RequestInit = {}) => {
    const url = API_CONFIG.buildUrl(path);
    const headers = {
      ...API_CONFIG.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      // Handle different content types
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },

  // Convenience methods for common HTTP verbs
  get: (path: string, options?: RequestInit) =>
    API_CONFIG.request(path, { ...options, method: "GET" }),

  post: (path: string, data?: any, options?: RequestInit) =>
    API_CONFIG.request(path, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (path: string, data?: any, options?: RequestInit) =>
    API_CONFIG.request(path, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (path: string, options?: RequestInit) =>
    API_CONFIG.request(path, { ...options, method: "DELETE" }),
};

// Health check function
export const checkWeaviateHealth = async () => {
  try {
    const response = await API_CONFIG.get("/meta");
    return { healthy: true, data: response };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Export for use in components
export default API_CONFIG;
