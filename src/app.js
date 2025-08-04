const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { handleCspReport, renderCspDashboard } = require('./csp-reporting');
const app = express();
let PORT = 3000;

let vipGuests = []; // Simulated database (non-persistent)

// Allow CORS
app.use(
    cors({
        origin: '*', // Allow requests from any origin 
        methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
        allowedHeaders: ['Content-Type'], // Allow specific headers
        credentials: true, // Include cookies in cross-origin requests
    })
);

// Custom header
app.use((req, res, next) => {
    res.setHeader('X-Example', 'this is a new custom header');
    
    // <-- placeholder for header manipulation code -->
    next();
});


// Basic CSP that allows scripts from CDN and self (not breaking functionality was important when creating CSP, but it could be improved)
app.use((req, res, next) => {
    // Set the Content-Security-Policy header: 
    // default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
    res.setHeader('Content-Security-Policy', [
        // Restrict the default behaviour for all resources to only allow loading from the same origin
        "default-src 'self';",
        // Allow scripts to be loaded only from the same origin and the specified CDN
        // Note: 'unsafe-inline' is included, which weakens security. Replace it with hashes or nonces if possible.
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;",
        // Allow styles to be loaded only from the same origin and the specified CDN
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;",
        // Restrict connections (e.g., AJAX, WebSocket) to only the same origin
        "connect-src 'self';",
        // Restrict images to load only from the same origin or `data:` URIs
        "img-src 'self' data:;",
    ].join(' ')); 

    next();
});

// Body parser to handle JSON requests
app.use(bodyParser.json());
// Serve static files
app.use(express.static('public'));

//  Endpoint to View All VIP Guests
app.get('/api/orders', (req, res) => {
    res.json(vipGuests);
});

// VIP Guest Registration Endpoint (POST & GET - GET for CSRF via <img>)
app.all('/api/order', (req, res) => {
    const { order, name } = req.method === 'POST' ? req.body : req.query;

    // Add the guest directly to the database
    vipGuests.push({ order, name });

    console.log(`New ${req.method} guest registration: ${name} reserved for ${order}`);

    if (req.method === 'POST') {
        res.json({ message: `${name} has been added to the VIP list for ${order}!` });
    } else {
        res.send(`<p>${name} has been registered for ${order}!</p>`);
    }
});

//  Endpoint to Clear All VIP Guests
app.get('/api/clear-orders', (req, res) => {
    vipGuests = []; // Clear the database (all guests)
    console.log('All VIP guests cleared!');
    res.json({ message: 'All VIP guests have been cleared from the list!' });
});

// Middleware to handle CSP report endpoint
app.use('/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }));
app.post('/csp-report', handleCspReport);
app.get('/csp-dashboard', renderCspDashboard);


// Function to find an available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = require('net').createServer();
        
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Try next port
                findAvailablePort(startPort + 1).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
    });
}

// Start server with automatic port finding
findAvailablePort(PORT).then(availablePort => {
    PORT = availablePort;
    app.listen(PORT, () => {
        console.log(`🎰 Las Vegas Nightlife App running at http://localhost:${PORT}`);
        console.log(`📊 CSP Dashboard: http://localhost:${PORT}/csp-dashboard`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});