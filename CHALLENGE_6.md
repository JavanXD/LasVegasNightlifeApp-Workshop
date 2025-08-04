# Challenge 6: CSP Violation Reporting and Monitoring

## Objective
Implement CSP violation reporting using both `report-uri` and `report-to` directives to capture and monitor XSS attempts and other policy violations.

## Background
Content Security Policy (CSP) reporting allows you to monitor violations in real-time. This helps detect:

- XSS attempts
- Malicious script injections
- Policy bypass attempts
- Browser extension interference

## Attack Scenarios

1. **XSS Attempt**: Attacker tries to inject `<script>alert('XSS')</script>`
2. **External Script**: Malicious script from an unauthorised domain
3. **Inline Script**: Unauthorised inline JavaScript execution
4. **Data URI Script**: JavaScript execution via `data:` URIs

## Step-by-Step Protection

### 1. Add CSP Reporting Directives

Edit `src/app.js` and modify the CSP header to include reporting:

```javascript
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self';",
        "script-src 'self' 'nonce-unique123' https://cdn.jsdelivr.net;",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;",
        "connect-src 'self';",
        "img-src 'self' data:;",
        // Add these reporting directives:
        "report-uri /csp-report;",
        "report-to csp-endpoint;"
    ].join(' ')); 
    
    next();
});
```

### 2. Test CSP Violations

Trigger violations to see reporting in action:

```bash
# Test XSS attempt
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"XSS\")</script>","order":"High Rollers Poker"}' \
  http://localhost:3000/api/order

# Test external script violation
curl -X POST -H "Content-Type: application/json" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/","violated-directive":"script-src","blocked-uri":"http://evil.com/script.js","source-file":"http://localhost:3000/"}}' \
  http://localhost:3000/csp-report
```

### 3. Monitor Dashboard

Visit `http://localhost:3000/csp-dashboard` to see:

- Raw CSP violation data
- All available fields dynamically displayed
- Real-time violation monitoring

## Analysis

### High-Risk Violations vs False Positives

**High-Risk Indicators:**

- Script violations from unknown domains
- Inline script execution attempts
- Data URI script violations
- Multiple violations from same IP

**False Positives:**

- Browser extensions (`chrome-extension://`, `moz-extension://`)
- Development tools (localhost, 127.0.0.1)
- Legitimate CDNs (`cdn.jsdelivr.net`, `unpkg.com`)
- Analytics services (`google-analytics.com`)

## Advanced Ideas to Improve the CSP Dashboard

### 1. Distinguish Browser Extensions

Implement logic to identify and filter browser extension violations:

```javascript
const isBrowserExtension = (blockedURI) => {
    return blockedURI.includes('chrome-extension') || 
           blockedURI.includes('moz-extension') ||
           blockedURI.includes('safari-extension');
};
```

### 2. Alert Thresholds

Set up automated alerts for suspicious activity:

```javascript
const suspiciousPatterns = [
    { pattern: /eval\(/, severity: 'high' },
    { pattern: /javascript:/, severity: 'high' },
    { pattern: /chrome-extension/, severity: 'low' }
];
```

## CSP Report Tampering & Evasion

### 🚨 Important Security Lesson: CSP Reporting is NOT Reliable

CSP reporting can be easily tampered with or bypassed by attackers.

### 1. Report Tampering Examples

Attackers can modify CSP reports to hide their tracks:

```bash
# Normal CSP violation report
curl -X POST -H "Content-Type: application/json" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/","violated-directive":"script-src","blocked-uri":"http://evil.com/script.js","source-file":"http://localhost:3000/"}}' \
  http://localhost:3000/csp-report

# Tampered report - modified IP address
curl -X POST -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/","violated-directive":"script-src","blocked-uri":"http://evil.com/script.js","source-file":"http://localhost:3000/"}}' \
  http://localhost:3000/csp-report

# Tampered report - fake user agent
curl -X POST -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/","violated-directive":"script-src","blocked-uri":"http://evil.com/script.js","source-file":"http://localhost:3000/"}}' \
  http://localhost:3000/csp-report
```

### 2. Browser Evasion Techniques

Attackers can disable CSP reporting entirely:

- **Browser Extensions**: "CSP Evaluator", "CSP Disabler", "NoScript"
- **Developer Tools**: Disable CSP in browser settings
- **Custom User Agents**: Modify browser to ignore CSP headers
- **Proxy Interception**: Strip CSP headers before reaching browser
- **Custom Browsers**: Use browsers that don't enforce CSP

## Key Takeaways

1. **CSP reporting is a monitoring tool, not a security control**
2. **Reports can be easily tampered with or disabled**
3. **Use CSP reporting for insights, not for security decisions**
4. **Implement multiple layers of defence**
5. **Server-side validation is always more reliable than client-side reporting**

## Testing Your Implementation

1. Start the application: `npm start`
2. Visit the main app: `http://localhost:3000`
3. Visit the CSP dashboard: `http://localhost:3000/csp-dashboard`
4. Trigger violations (e.g. using the XSS payload from previous challenges)
5. Observe how reports show in the DevTools and how they appear in the dashboard
