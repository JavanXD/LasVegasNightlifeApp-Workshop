const express = require('express');

// In-memory storage for CSP reports (in production, use a database)
let cspReports = [];

// CSP Report endpoint
const handleCspReport = (req, res) => {
  const raw = req.body;
  const id = Date.now() + Math.random();
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const violation = {
    id,
    timestamp: new Date().toISOString(),
    ...raw['csp-report'],
    userAgent,
    ip
  };

  // Store in memory
  cspReports.push(violation);

  console.log('📦 CSP Violation Report Received:\n', JSON.stringify(violation, null, 2));
  res.sendStatus(204);
};

// Dashboard to view reports as raw JSON
const renderCspDashboard = (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSP Reports - Raw JSON</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #fafafa; }
    pre { background: #f0f0f0; padding: 12px; border: 1px solid #ccc; border-radius: 5px; overflow-x: auto; }
    h1 { font-size: 24px; }
  </style>
</head>
<body>
  <h1>CSP Violation Reports (${cspReports.length})</h1>
  <p>Below are the raw JSON reports received via CSP reporting:</p>

  ${cspReports.length === 0 ? '<p>No reports received yet.</p>' : ''}

  ${cspReports.map(report => `
    <pre>${JSON.stringify(report, null, 2)}</pre>
  `).join('')}
</body>
</html>
  `;

  res.send(html);
};

module.exports = {
  handleCspReport,
  renderCspDashboard
};