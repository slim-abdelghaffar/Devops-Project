// Configuration - update this with your backend service
const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // For local development
    : 'http://BACKEND_SERVICE_IP'; // Will be updated after deployment

// Update timestamp
function updateTimestamp() {
    document.getElementById('timestamp').textContent = 
        `Last updated: ${new Date().toLocaleString()}`;
}

// Check backend health and get data
async function checkBackend() {
    const statusCard = document.getElementById('statusCard');
    const statusText = document.getElementById('statusText');
    const deploymentInfo = document.getElementById('deploymentInfo');
    const apiResponse = document.getElementById('apiResponse');

    try {
        statusText.textContent = 'Connecting...';
        statusText.style.color = '#ffc107';
        
        // Call backend API
        const response = await fetch(`${BACKEND_URL}/api/data`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Update status
        statusText.textContent = '✅ Connected & Healthy';
        statusText.style.color = '#28a745';
        statusCard.style.borderLeftColor = '#28a745';
        
        // Display deployment info
        deploymentInfo.innerHTML = `
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Pipeline:</strong> ${data.deployment}</p>
            <p><strong>Environment:</strong> ${data.environment}</p>
            <p><strong>Build:</strong> #${data.build}</p>
            <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        `;
        
        // Display full response
        apiResponse.textContent = JSON.stringify(data, null, 2);
        
        updateTimestamp();
        
    } catch (error) {
        statusText.textContent = '❌ Connection Failed';
        statusText.style.color = '#dc3545';
        statusCard.style.borderLeftColor = '#dc3545';
        
        deploymentInfo.innerHTML = `
            <p style="color: #dc3545;"><strong>Error:</strong> ${error.message}</p>
            <p>Make sure the backend service is running and accessible.</p>
            <p><strong>Backend URL:</strong> ${BACKEND_URL}</p>
        `;
        
        apiResponse.textContent = JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString()
        }, null, 2);
    }
}

// Get version information
async function getVersion() {
    const apiResponse = document.getElementById('apiResponse');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/version`);
        const data = await response.json();
        
        apiResponse.textContent = JSON.stringify(data, null, 2);
        updateTimestamp();
        
    } catch (error) {
        apiResponse.textContent = JSON.stringify({
            error: error.message,
            note: 'Could not fetch version info'
        }, null, 2);
    }
}

// Check backend on page load
window.addEventListener('load', () => {
    updateTimestamp();
    checkBackend();
    
    // Auto-refresh every 30 seconds
    setInterval(checkBackend, 30000);
});