const express = require('express');

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Status route for health checks
app.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

// Info route to provide server information
app.get('/info', (req, res) => {
  res.json({
    message: 'AWS Test App Server',
    version: '1.0.0',
    port: port,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});