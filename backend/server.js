const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'backend-api',
        uptime: process.uptime()
    });
});

// Main API endpoint
app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello from Jenkins CI/CD Pipeline! 🚀',
        deployment: 'GitHub → Jenkins → SonarQube → Docker → ACR → AKS',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        build: process.env.BUILD_NUMBER || 'local'
    });
});

// Version endpoint
app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.0',
        buildNumber: process.env.BUILD_NUMBER || 'local',
        deployedAt: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'CI/CD Demo API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            data: '/api/data',
            version: '/api/version'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});