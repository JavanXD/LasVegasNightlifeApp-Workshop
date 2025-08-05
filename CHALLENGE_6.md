# Challenge 6: CSP Violation Reporting and Monitoring

## Objective
Implement CSP violation reporting using `report-uri` directive to capture and monitor XSS attempts and other policy violations.

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
        // Add the reporting directive (report-uri works on http://, in future it will become deprecated and replaced by report-to):
        "report-uri /csp-report;"
    ].join(' ')); 
    
    next();
});
```

### 2. Test CSP Violations

Trigger violations to see reporting in action:

1. Remove the `unsafe-inline` directive from `script-src` temporarily.
2. Trigger an XSS violation by injecting an image with an `onerror` handler:
    ```html
    Name<img src="#" onerror="console.log('XSS triggered via onerror'); document.body.style.backgroundColor = 'orange';" alt="XSS1">
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


## CSP Report Tampering & Evasion

### 🚨 Important Security Lesson: CSP Reporting is NOT Reliable

CSP reporting can be easily tampered with or bypassed by attackers.

### 1. Report Tampering Examples

Be aware, that attackers can modify CSP reports to hide their tracks or flood your CSP report receiver service:

```bash
# Normal CSP violation report
curl -X POST -H "Content-Type: application/json" \
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

- **Browser Extensions**: "CSP Evaluator", "CSP Disabler", "NoScript", "uBlock Origin" with "Disable CSP Reports" setting.  
- **Developer Tools**: Disable CSP in browser settings
- **Custom User Agents**: Modify browser to ignore CSP headers
- **Proxy Interception**: Strip CSP headers before reaching browser

### 3. Filter Browser Extension Violations

As an example, you could implement logic to identify and filter browser extension violations, to reduce noise: 

```javascript
const isBrowserExtension = (blockedURI) => {
    return blockedURI.includes('chrome-extension') || 
           blockedURI.includes('moz-extension') ||
           blockedURI.includes('safari-extension');
};
```

## Key Takeaways

1. **CSP reporting is a monitoring tool, not a security control**
2. **Reports can be easily tampered with or disabled**
3. **Use CSP reporting for insights, not for security decisions**
4. **Implement multiple layers of defence**
5. **Server-side validation is always more reliable than client-side reporting**

## Testing Your Implementation

1. After adding the `report-uri` directive to your CSP and making the changes in the code, restart the application: `npm start`
2. Visit the main app: `http://localhost:3000`
3. Visit the CSP dashboard: `http://localhost:3000/csp-dashboard`
4. Trigger violations (e.g. using the XSS payload from previous challenges)
5. Observe how reports show in the DevTools and how they appear in the dashboard
