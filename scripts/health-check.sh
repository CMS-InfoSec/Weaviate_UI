#!/bin/bash

# Health check script for the container
# This script is used by Docker and Kubernetes health checks

set -e

# Default URL if not provided
HEALTH_URL=${HEALTH_URL:-"http://localhost:8080/health"}

# Function to check if the service is responding
check_health() {
    local response
    local http_code

    # Use curl to check the health endpoint
    response=$(curl -s -w "%{http_code}" "$HEALTH_URL" || echo "000")
    http_code=$(echo "$response" | tail -c 4)

    if [ "$http_code" = "200" ]; then
        echo "✅ Health check passed - Service is healthy"
        return 0
    else
        echo "❌ Health check failed - HTTP $http_code"
        return 1
    fi
}

# Function to check if nginx is running
check_nginx() {
    if pgrep nginx > /dev/null; then
        echo "✅ Nginx is running"
        return 0
    else
        echo "❌ Nginx is not running"
        return 1
    fi
}

# Main health check
echo "🔍 Performing health check..."

# Check if nginx is running
if ! check_nginx; then
    exit 1
fi

# Check if the health endpoint responds
if ! check_health; then
    exit 1
fi

echo "🎉 All health checks passed!"
exit 0
