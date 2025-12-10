# CI/CD Demo Application

Full-stack application demonstrating enterprise CI/CD pipeline.

## Architecture
```
GitHub → Jenkins → SonarQube → Docker → ACR → AKS
```

## Components

- **Backend**: Node.js Express API
- **Frontend**: Static HTML/CSS/JS
- **CI/CD**: Jenkins pipeline
- **Quality**: SonarQube scanning
- **Registry**: Azure Container Registry
- **Deployment**: Azure Kubernetes Service

## Local Development

### Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
# Open index.html in browser
# Or use live server
```

## Pipeline Stages

1. **Checkout** - Pull code from GitHub
2. **SonarQube Analysis** - Code quality scan
3. **Build** - Create Docker images
4. **Push** - Upload to ACR
5. **Deploy** - Deploy to AKS
6. **Verify** - Get service URLs

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/data` - Main data endpoint
- `GET /api/version` - Version info

## Deployment

Push to `main` branch to trigger automated deployment.
```bash
git add .
git commit -m "Update application"
git push origin main
```

Jenkins will automatically:
- Run tests
- Scan code quality
- Build Docker images
- Deploy to Kubernetes