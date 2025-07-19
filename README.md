# Weaviate Admin UI

A modern, production-ready React-based admin interface for Weaviate vector databases. This UI provides comprehensive management capabilities including schema management, object operations, monitoring, and developer tools.


## ✨ Features

- **Dashboard**: Real-time cluster metrics and health monitoring
- **Schema Management**: Create, modify, and explore your Weaviate schema
- **Object Management**: CRUD operations with advanced search and filtering
- **Reference Management**: Handle object relationships and connections
- **Advanced Search**: Multi-modal search (Vector, Hybrid, Keyword, GraphQL)
- **Module Configuration**: Manage vectorizers and other Weaviate modules
- **Backup & Restore**: Comprehensive backup management with scheduling
- **Monitoring & Logs**: Real-time system monitoring and log analysis
- **Settings**: Complete cluster configuration and user management
- **Developer Tools**: API explorer, GraphQL playground, and debugging tools

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm
- Access to a Weaviate instance

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd weaviate-admin-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your Weaviate endpoint
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`.

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_WEAVIATE_ENDPOINT=https://weaviate.cmsinfosec.com/v1
PUBLIC_URL=https://ui.weaviate.cmsinfosec.com
```

### Build for Production

```bash
npm run build
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t weaviate-admin-ui .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e REACT_APP_WEAVIATE_ENDPOINT=https://weaviate.cmsinfosec.com/v1 \
  -e PUBLIC_URL=https://ui.weaviate.cmsinfosec.com \
  weaviate-admin-ui
```

### Docker Compose

```yaml
version: "3.8"
services:
  weaviate-admin-ui:
    build: .
    ports:
      - "8080:8080"
    environment:
      - REACT_APP_WEAVIATE_ENDPOINT=https://weaviate.cmsinfosec.com/v1
      - PUBLIC_URL=https://ui.weaviate.cmsinfosec.com
    restart: unless-stopped
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (tested on Linode LKE)
- NGINX Ingress Controller
- Cert-Manager for TLS certificates
- kubectl configured

### 1. Install Required Components

**NGINX Ingress Controller:**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

**Cert-Manager:**

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 2. Configure TLS Certificates

Edit `k8s/cert-manager.yaml` and update the email address:

```yaml
email: your-email@domain.com # Replace with your email
```

Apply the ClusterIssuer:

```bash
kubectl apply -f k8s/cert-manager.yaml
```

### 3. Deploy the Application

```bash
kubectl apply -f k8s/deployment.yaml
```

### 4. Verify Deployment

```bash
# Check deployment status
kubectl get deployments
kubectl get pods -l app=weaviate-admin-ui

# Check ingress
kubectl get ingress

# Check certificate
kubectl get certificates
```

### 5. Access the Application

The application will be available at: https://ui.weaviate.cmsinfosec.com

## 🔧 Configuration

### Environment Variables

| Variable                      | Description           | Default                              |
| ----------------------------- | --------------------- | ------------------------------------ |
| `REACT_APP_WEAVIATE_ENDPOINT` | Weaviate API endpoint | `https://weaviate.cmsinfosec.com/v1` |
| `PUBLIC_URL`                  | Public URL for the UI | `https://ui.weaviate.cmsinfosec.com` |
| `REACT_APP_WEAVIATE_API_KEY`  | API key (if required) | -                                    |

### Kubernetes Configuration

**Resource Limits:**

- Memory: 128Mi limit, 64Mi request
- CPU: 200m limit, 100m request

**Security:**

- Non-root user (UID 1001)
- Read-only root filesystem
- No privilege escalation
- Dropped capabilities

**Health Checks:**

- Liveness probe on `/health`
- Readiness probe on `/health`

## 🚀 CI/CD with GitHub Actions

The repository includes a complete GitHub Actions workflow for automated building and deployment.

### Setup

1. **Configure Secrets:**

   - `KUBE_CONFIG`: Base64-encoded kubeconfig file
   - `GITHUB_TOKEN`: Automatically provided

2. **Workflow Triggers:**

   - Push to `main` branch (build + deploy)
   - Pull requests (build only)

3. **Features:**
   - Automated testing
   - Docker image building and pushing to GitHub Container Registry
   - Kubernetes deployment with rollout verification
   - Health checks after deployment

## 🔒 Security

- **HTTPS Only**: All connections enforced over HTTPS
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Container Security**: Non-root user, minimal attack surface
- **TLS Certificates**: Automated with Let's Encrypt via Cert-Manager

## 📝 API Integration

The UI connects to your Weaviate instance via REST and GraphQL APIs:

- **REST API**: Full CRUD operations for objects and schema
- **GraphQL**: Advanced querying capabilities
- **WebSocket**: Real-time updates (if supported by your Weaviate instance)

## 🐛 Troubleshooting

### Common Issues

**1. Connection Refused**

```bash
# Check if Weaviate endpoint is accessible
curl https://weaviate.cmsinfosec.com/v1/meta
```

**2. TLS Certificate Issues**

```bash
# Check certificate status
kubectl describe certificate weaviate-admin-ui-tls

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

**3. Ingress Not Working**

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress configuration
kubectl describe ingress weaviate-admin-ui-ingress
```

### Logs

```bash
# Application logs
kubectl logs -l app=weaviate-admin-ui

# Ingress logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

- Create an issue in this repository
- Check the [Weaviate documentation](https://weaviate.io/developers/weaviate)
- Join the [Weaviate community](https://weaviate.io/slack)
